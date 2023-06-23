module.exports = {
	extends: 'standard',
	env: {
		node: true,
		mocha: true
	},
	rules: {
		semi: [2, 'always'],
		indent: [2, 'tab'],
		'no-tabs': 0,
		'space-before-function-paren': ['error', 'never'],
		'prefer-promise-reject-errors': 'off'
	},
};
