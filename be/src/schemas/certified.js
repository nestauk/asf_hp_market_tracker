export const schema = {
	schema: {
		querystring: {
			type: 'object',
			properties: {
				logic: {
					default: 'overlaps',
					type: 'string',
					enum: ['overlaps', 'engulfs', 'dropped', 'new']
				},
			}
		}
	}
};
