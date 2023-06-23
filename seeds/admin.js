exports.seed = function(knex) {
	// Deletes ALL existing entries
	return Promise.all([
		knex('tenants')
			.del()
			.then(function() {
				// Inserts seed entries
				return knex('tenants').insert([
					{
						id: '00000000-0000-0000-0000-000000000001',
						domain: 'base_tenant',
						title: 'Base Tenant'
					}
				]);
			})
			.then(() => {
				return knex('users').del();
			})
			.then(function() {
				// Inserts seed entries
				return knex('users').insert([
					{
						id: '00000000-0000-0000-0000-000000000001',
						email: 'superadmin@basetenant.com',
						first_name: 'Super',
						last_name: 'Admin',
						phone_number: '1234567890',
						encrypted_password:
							'$2b$12$mv093xwR2SFGQ3KuA9xb4uvcyFLduH7t6JE/25/EIfsPg9rgnECcK'
					}
				]);
			})
			.then(() => {
				return knex('tenant_users').insert([
					{
						tenant_id: '00000000-0000-0000-0000-000000000001',
						user_id: '00000000-0000-0000-0000-000000000001'
					}
				]);
			})
			.then(() => {
				knex('roles').del();
			})
			.then(function() {
				// Inserts seed entries
				return knex('roles').insert([
					{ id: 'ff000000-0000-0000-0000-000000000000', name: 'super_admin', display_name: 'SUPER ADMIN' },
					{ id: 'ff000000-0000-0000-0000-000000000002', name: 'tenant_admin', display_name: 'TENANT ADMIN', type: 'system' },
					{ id: 'ff000000-0000-0000-0000-000000000001', name: 'tester', display_name: 'TESTER' },
					{ id: 'ff000000-0000-0000-0000-000000000003', name: 'project_manager', display_name: 'PROJECT MANAGER' },
					{ id: 'ff000000-0000-0000-0000-000000000004', name: 'view_only', display_name: 'VIEW ONLY' }
				]);
			})
			.then(() => {
				knex('users_roles').del();
			})
			.then(function() {
				// Inserts seed entries
				return knex('users_roles').insert([
					{
						role_id: 'ff000000-0000-0000-0000-000000000000',
						user_id: '00000000-0000-0000-0000-000000000001'
					}
				]);
			})
	]);
};
