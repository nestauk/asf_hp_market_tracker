export const schema = {
	schema: {
		querystring: {
			type: 'object',
			required: ['field1'],
			properties:	{
				field1: {
					type: 'string'
				},
				logic2: {
					default: 'overlaps',
					type: 'string',
					enum: ['overlaps', 'engulfs', 'new', 'dropped']
				}
			}
		}
	}
};
