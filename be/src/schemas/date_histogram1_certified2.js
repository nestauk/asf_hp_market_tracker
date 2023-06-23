export const schema = {
	schema: {
		querystring: {
			type: 'object',
			properties:	{
				calendar_interval1: {
					default: '1y',
					type: 'string',
					enum: ['1M', '1q', '1y']
				},
			}
		}
	}
};
