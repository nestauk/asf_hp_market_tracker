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
		label: 'Amount of installations',
		title: 'Amount of installations',
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
		entity: 'Installer',
		id: 'installations_per_installer',
		formatSpecifier: '.1f',
		geoPrefix: 'property',
		label: 'Amount of installations per installer',
		title: 'Amount of installations per installer',
		type: 'count',
	},
	{
		entity: 'Installer',
		formatSpecifier: '.2s',
		geoPrefix: 'installer',
		id: 'installers',
		label: 'Amount of active installers',
		title: 'Amount of active installers',
		type: 'count',
	},
	{
		entity: 'Installer',
		formatSpecifier: '.3s',
		geoPrefix: 'installer',
		id: 'installers_certified',
		label: 'Amount of certified installers',
		title: 'Amount of certified installers',
		type: 'count'
	},
	{
		entity: 'Installer',
		formatSpecifier: '.3s',
		geoPrefix: 'installer',
		id: 'installers_dropped_certifications',
		label: 'Amount of expired certificates',
		title: 'Amount of expired certificates ',
		type: 'count'
	},
	{
		entity: 'Installer',
		formatSpecifier: '.3s',
		geoPrefix: 'installer',
		id: 'installers_new_certifications',
		label: 'Amount of new/renewed certificates',
		title: 'Amount of new/renewed certificates',
		type: 'count'
	},
];
