import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const migration=readFileSync("supabase/migrations/202608230009_administration_operations.sql","utf8");
const page=readFileSync("src/components/admin-operations.tsx","utf8");
test("admin operations are enforced and audited in PostgreSQL",()=>{assert.match(migration,/active_administrator_required/g);assert.match(migration,/administrator_cannot_remove_own_access/);assert.match(migration,/account_administration_changed/);assert.match(migration,/program_operation_configuration_changed/)});
test("blocked and inactive accounts cannot be bypassed by UI-only rules",()=>{assert.match(migration,/target_status public\.account_status/);assert.match(migration,/update public\.profiles set role=target_role,status=target_status/)});
test("dashboard covers all operational deliveries",()=>{for(const text of ["Contas e perfis","Coordenações, Magic Link, guia e SLA","Mural e status","Templates básicos","Estatísticas e exportação","Expurgo do Nada Consta","Logs operacionais"])assert.match(page,new RegExp(text))});
test("exports stay client-side and do not expose secrets",()=>{assert.match(page,/Exportar CSV/);assert.match(page,/Exportar JSON/);assert.doesNotMatch(page,/service_role|SUPABASE_SERVICE/)});
