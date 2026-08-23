begin;
create extension if not exists pgtap with schema extensions;
select plan(17);

select has_table('public','repository_deposit_progress','progresso do autodepósito existe');
select policies_are('public','repository_deposit_progress',array['repository_deposit_progress_staff_read','repository_deposit_progress_student_read_own'],'somente políticas de leitura previstas existem');
select function_returns('public','start_repository_deposit',array['uuid'],'timestamp with time zone','RPC do estudante retorna o início');
select function_returns('public','set_repository_deposit_enabled',array['uuid','boolean'],'void','RPC administrativo existe');
select ok((select not repository_deposit_enabled from public.academic_programs where code='architecture-urbanism-undergraduate'),'TFG de graduação começa desativado');

insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values
 ('98000000-0000-4000-8000-000000000001','deposito.estudante@ufba.br',now(),'{"registration_source":"student","full_name":"Estudante Depósito","cpf":"81000000346"}'),
 ('98000000-0000-4000-8000-000000000002','deposito.admin@ufba.br',now(),'{}'),
 ('98000000-0000-4000-8000-000000000003','deposito.catalogador@ufba.br',now(),'{}');
insert into public.profiles(id,full_name,email,role,status) values
 ('98000000-0000-4000-8000-000000000002','Administrador Depósito','deposito.admin@ufba.br','administrator','active'),
 ('98000000-0000-4000-8000-000000000003','Catalogador Depósito','deposito.catalogador@ufba.br','cataloger','active');
insert into public.staff_profiles(profile_id,professional_name,crb) values
 ('98000000-0000-4000-8000-000000000002','Administrador Depósito','CRB-5/4000'),
 ('98000000-0000-4000-8000-000000000003','Catalogador Depósito','CRB-5/4001');

set local role authenticated;
set local request.jwt.claim.sub='98000000-0000-4000-8000-000000000001';
select lives_ok($$select * from public.open_student_request(jsonb_build_object(
 'academicProgramId',(select id from public.academic_programs where repository_deposit_enabled order by code limit 1),
 'registrationNumber','RI2026','title','Trabalho para o RI','publicWorkUrl','https://example.org/work.pdf',
 'people',jsonb_build_object('author','Ana','advisor','Bia'),'keywordsPt',jsonb_build_array('Arquitetura'),
 'keywordsEn',jsonb_build_array('Architecture'),'specialCases',jsonb_build_array(),
 'defendedAndApproved',true,'finalFileConfirmed',true,'approvalPageConfirmed',true))$$,'solicitação criada');
select throws_ok($$select public.start_repository_deposit((select id from public.cataloging_requests limit 1))$$,'P0001','repository_deposit_not_available','não inicia antes da liberação completa');
reset role;

update public.cataloging_requests set status='approved',assigned_to='98000000-0000-4000-8000-000000000003';
insert into public.cataloging_card_homologations(request_id,snapshot,homologated_by,librarian_name_snapshot,librarian_crb_snapshot)
 select id,'{}','98000000-0000-4000-8000-000000000003','Catalogador Depósito','CRB-5/4001' from public.cataloging_requests;
insert into public.nada_consta_documents(request_id,object_path,original_name,size_bytes,mime_type,sha256,status,uploaded_by,validated_by,validated_at,released_at)
 select id,id::text||'/nada-consta.pdf','nada.pdf',100,'application/pdf',repeat('a',64),'approved','98000000-0000-4000-8000-000000000001','98000000-0000-4000-8000-000000000003',now(),now() from public.cataloging_requests;

set local role authenticated;
set local request.jwt.claim.sub='98000000-0000-4000-8000-000000000001';
select lives_ok($$select public.start_repository_deposit((select id from public.cataloging_requests limit 1))$$,'estudante liberado registra o início');
select is((select count(*)::integer from public.repository_deposit_progress),1,'um progresso é criado');
select lives_ok($$select public.start_repository_deposit((select id from public.cataloging_requests limit 1))$$,'registro do início é idempotente');
reset role;
select is((select count(*)::integer from public.audit_logs where action='repository_deposit_started'),1,'início gera um único log');

update public.profiles set status='blocked' where id='98000000-0000-4000-8000-000000000001';
set local role authenticated;
set local request.jwt.claim.sub='98000000-0000-4000-8000-000000000001';
select is((select count(*)::integer from public.repository_deposit_progress),0,'estudante bloqueado não conserva leitura operacional');
select throws_ok($$select public.start_repository_deposit((select id from public.cataloging_requests limit 1))$$,'P0001','active_student_required','estudante bloqueado não registra início');

set local request.jwt.claim.sub='98000000-0000-4000-8000-000000000003';
select throws_ok($$select public.set_repository_deposit_enabled((select id from public.academic_programs where code='architecture-urbanism-undergraduate'),true)$$,'P0001','active_administrator_required','catalogador não altera configuração');
set local request.jwt.claim.sub='98000000-0000-4000-8000-000000000002';
select lives_ok($$select public.set_repository_deposit_enabled((select id from public.academic_programs where code='architecture-urbanism-undergraduate'),true)$$,'administrador ativa o módulo');
select ok((select repository_deposit_enabled from public.academic_programs where code='architecture-urbanism-undergraduate'),'configuração foi atualizada');
select is((select count(*)::integer from public.audit_logs where action='repository_deposit_configuration_changed'),1,'configuração gera log');

select * from finish();
rollback;
