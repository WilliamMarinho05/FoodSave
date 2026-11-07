-- Corrige o cadastro de usuários.
--
-- O trigger que cria a linha em public.perfis depois do signup não informa
-- a coluna "nivel", que é NOT NULL e não possui valor padrão. Por isso o
-- Supabase retorna:
--   null value in column "nivel" of relation "perfis" violates not-null constraint
-- e o cadastro inteiro é revertido (o usuário nem chega a ser criado).

-- 1) Valor padrão para novos perfis (caso o trigger omita a coluna).
alter table public.perfis
  alter column nivel set default 1;

alter table public.perfis
  alter column exp set default 0;

-- 2) Normaliza NULL explícito antes da checagem de NOT NULL.
--    Triggers BEFORE INSERT executam antes das constraints, então mesmo que
--    o trigger atual envie nivel = NULL explicitamente, a linha é gravada
--    com nivel = 1 (e exp = 0).
create or replace function public.normalizar_perfil_novo()
returns trigger
language plpgsql
as $$
begin
  new.nivel := coalesce(new.nivel, 1);
  new.exp := coalesce(new.exp, 0);
  return new;
end;
$$;

drop trigger if exists normalizar_perfil_novo on public.perfis;

create trigger normalizar_perfil_novo
before insert on public.perfis
for each row
execute function public.normalizar_perfil_novo();

-- 3) Garante que perfis antigos também tenham valores válidos.
update public.perfis set nivel = 1 where nivel is null;
update public.perfis set exp = 0 where exp is null;

-- 4) Recarrega o cache de schema do PostgREST para o app enxergar a mudança.
notify pgrst, 'reload schema';
