export const counts = [

	/* Heat pump */

	{
		entity: 'Heat pump',
		field: 'hp_feature_power_capacity',
		formatSpecifier: '.3s',
		geoPrefix: 'property',
		id: 'hp_feature_power_capacity_sum',
		isCumulative: true,
		label: 'Total power capacity',
		type: 'count',
		unitOfMeasure: 'kW',
	},
	{
		entity: 'Heat pump',
		field: 'hp_feature_power_generation',
		formatSpecifier: '.3s',
		geoPrefix: 'property',
		id: 'hp_feature_power_generation_sum',
		isCumulative: true,
		label: 'Total power generation',
		type: 'count',
		unitOfMeasure: 'kWh',
	},

	/* Installation */

	{
		entity: 'Installation',
		geoPrefix: 'property',
		id: 'installations',
		isCumulative: true,
		formatSpecifier: '.3s',
		label: 'Number of installations',
		title: 'Number of installations',
		type: 'count',
	},
	{
		entity: 'Installation',
		field: 'installation_cost',
		formatSpecifier: '.4s',
		geoPrefix: 'property',
		id: 'installation_cost_sum',
		isCumulative: true,
		label: 'Market value',
		type: 'count',
		unitOfMeasure: 'GBP',
	},

	/* Installer */

	{
		entity: 'Installation companies',
		id: 'installations_per_installer',
		formatSpecifier: '.1f',
		geoPrefix: 'property',
		label: 'Number of installations per installer',
		title: 'Number of installations per installer',
		type: 'count',
	},
	{
		entity: 'Installation companies',
		formatSpecifier: '.2s',
		geoPrefix: 'installer',
		id: 'installers',
		label: 'Number of active installers',
		title: 'Number of active installers',
		type: 'count',
	},
	{
		entity: 'Installation companies',
		formatSpecifier: '.2s',
		geoPrefix: 'installer',
		id: 'installers_certified',
		label: 'Number of certified installers',
		title: 'Number of certified installers',
		type: 'count'
	},
	{
		entity: 'Installation companies',
		formatSpecifier: '.2s',
		geoPrefix: 'installer',
		id: 'installers_dropped_certifications',
		label: 'Number of expired certificates',
		title: 'Number of expired certificates ',
		type: 'count'
	},
	{
		entity: 'Installation companies',
		formatSpecifier: '.2s',
		geoPrefix: 'installer',
		id: 'installers_new_certifications',
		label: 'Number of new/renewed certificates',
		title: 'Number of new/renewed certificates',
		type: 'count'
	},
];
