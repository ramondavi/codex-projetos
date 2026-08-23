begin;
create extension if not exists pgtap with schema extensions;
select plan(20);

insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values
 ('94000000-0000-4000-8000-000000000001','nada.estudante@ufba.br',now(),'{"registration_source":"student","full_name":"Estudante Nada","cpf":"81000000770"}'),
 ('94000000-0000-4000-8000-000000000002','nada.catalogador@ufba.br',now(),'{}'),
 ('94000000-0000-4000-8000-000000000003','nada.outro@ufba.br',now(),'{}');
insert into public.profiles(id,full_name,email,role,status) values
 ('94000000-0000-4000-8000-000000000002','Catalogador Nada','nada.catalogador@ufba.br','cataloger','active'),
 ('94000000-0000-4000-8000-000000000003','Outro Nada','nada.outro@ufba.br','cataloger','active');
insert into public.staff_profiles(profile_id,professional_name,crb) values
 ('94000000-0000-4000-8000-000000000002','Catalogador Nada','CRB-5/1111'),('94000000-0000-4000-8000-000000000003','Outro Nada','CRB-5/2222');

set local role authenticated; set local request.jwt.claim.sub='94000000-0000-4000-8000-000000000001';
select lives_ok($$select * from public.open_student_request(jsonb_build_object('academicProgramId',(select id from public.academic_programs limit 1),'registrationNumber','NADA2026','title','Teste Nada','publicWorkUrl','https://example.org/work.pdf','people',jsonb_build_object('author','Ana','advisor','Bia'),'keywordsPt',jsonb_build_array('Arquitetura'),'keywordsEn',jsonb_build_array('Architecture'),'specialCases',jsonb_build_array(),'defendedAndApproved',true,'finalFileConfirmed',true,'approvalPageConfirmed',true))$$,'solicitação criada');
reset role;
update public.cataloging_requests set status='approved',assigned_to='94000000-0000-4000-8000-000000000002';
set local role authenticated; set local request.jwt.claim.sub='94000000-0000-4000-8000-000000000001';
select throws_ok($$select public.register_nada_consta_upload((select id from public.cataloging_requests limit 1),'x/a.pdf','nada.pdf',5242881,'application/pdf',repeat('a',64))$$,'P0001','nada_consta_size_invalid','limite de 5 MB é imposto');
select throws_ok($$select public.register_nada_consta_upload((select id from public.cataloging_requests limit 1),(select id::text from public.cataloging_requests limit 1)||'/nada-consta.pdf','nada.txt',100,'text/plain',repeat('a',64))$$,'P0001','nada_consta_pdf_invalid','extensão e MIME são impostos');
select lives_ok($$select public.register_nada_consta_upload((select id from public.cataloging_requests limit 1),(select id::text from public.cataloging_requests limit 1)||'/nada-consta.pdf','nada.pdf',100,'application/pdf',repeat('a',64))$$,'upload válido é registrado');
select is((select count(*)::integer from public.nada_consta_documents),1,'um documento atual existe');
select is((select status from public.nada_consta_documents),'pending'::public.nada_consta_status,'documento aguarda validação');
select is((select count(*)::integer from public.nada_consta_documents),1,'estudante lê o próprio registro');
select throws_ok($$select public.register_nada_consta_upload((select id from public.cataloging_requests limit 1),(select id::text from public.cataloging_requests limit 1)||'/nada-consta.pdf','outro.pdf',100,'application/pdf',repeat('b',64))$$,'23505',null,'não permite dois documentos ativos');

set local request.jwt.claim.sub='94000000-0000-4000-8000-000000000003';
select throws_ok($$select public.validate_nada_consta((select id from public.nada_consta_documents),true,null)$$,'P0001','nada_consta_not_ready','outro catalogador não valida o ticket');
set local request.jwt.claim.sub='94000000-0000-4000-8000-000000000002';
select throws_ok($$select public.validate_nada_consta((select id from public.nada_consta_documents),false,'')$$,'P0001','rejection_reason_required','devolução exige justificativa');
select lives_ok($$select public.validate_nada_consta((select id from public.nada_consta_documents),true,null)$$,'responsável aprova e libera');
select is((select status from public.nada_consta_documents),'approved'::public.nada_consta_status,'documento fica aprovado');
select ok((select validated_at is not null and validated_by='94000000-0000-4000-8000-000000000002' from public.nada_consta_documents),'validação registra data e bibliotecário');
reset role;
select is((select count(*)::integer from public.email_outbox where event_type='request_released'),1,'aprovação gera aviso de liberação');
select is((select count(*)::integer from public.audit_logs where action='nada_consta_approved'),1,'aprovação gera log');
update public.cataloging_requests set status='completed';
select ok((select purge_after between now()+interval '59 days' and now()+interval '61 days' from public.nada_consta_documents),'encerramento programa expurgo em 60 dias');
update public.nada_consta_documents set purge_after=now()-interval '1 minute';
set local role authenticated; set local request.jwt.claim.sub='94000000-0000-4000-8000-000000000002';
select throws_ok($$select public.confirm_nada_consta_purge((select id from public.nada_consta_documents))$$,'P0001','active_administrator_required','catalogador não confirma expurgo');
reset role; update public.profiles set role='administrator' where id='94000000-0000-4000-8000-000000000002';
set local role authenticated; set local request.jwt.claim.sub='94000000-0000-4000-8000-000000000002';
select lives_ok($$select public.confirm_nada_consta_purge((select id from public.nada_consta_documents))$$,'administrador confirma expurgo executado');
select is((select status from public.nada_consta_documents),'purged'::public.nada_consta_status,'fica somente o registro textual');
select ok((select object_path is null and original_name='nada.pdf' and sha256=repeat('a',64) from public.nada_consta_documents),'arquivo some e metadados textuais permanecem');

select * from finish();
rollback;
