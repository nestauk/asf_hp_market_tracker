export const counts = [

	/* Heat pump */

	{
		entity: 'Heat pump',
		field: 'hp_feature_power_capacity',
		formatSpecifier: '.3s',
		id: 'hp_feature_power_capacity_sum',
		isAdditive: true,
		label: 'Total power capacity',
		type: 'count',
		unitOfMeasure: 'kW',
	},
	{
		entity: 'Heat pump',
		field: 'hp_feature_power_generation',
		formatSpecifier: '.3s',
		id: 'hp_feature_power_generation_sum',
		isAdditive: true,
		label: 'Total power generation',
		type: 'count',
		unitOfMeasure: 'kW',
	},

	/* Installation */

	{
		entity: 'Installation',
		id: 'installations',
		isAdditive: true,
		formatSpecifier: '.3s',
		label: 'Amount of installations',
		title: 'Amount of installations',
		type: 'count',
	},
	{
		entity: 'Installation',
		field: 'installation_cost',
		formatSpecifier: '.4s',
		id: 'installation_cost_sum',
		isAdditive: true,
		label: 'Market value',
		type: 'count',
		unitOfMeasure: 'GBP',
	},

	/* Installer */

	{
		entity: 'Installer',
		id: 'installations_per_installer',
		formatSpecifier: '.3s',
		label: 'Amount of installations per installer',
		title: 'Amount of installations per installer',
		type: 'count',
	},
	{
		entity: 'Installer',
		formatSpecifier: '.2s',
		id: 'installers',
		label: 'Amount of active installers',
		title: 'Amount of active installers',
		type: 'count',
	},
	{
		entity: 'Installer',
		formatSpecifier: '.3s',
		id: 'installers_certified',
		label: 'Amount of certified installers',
		title: 'Amount of certified installers',
		type: 'count'
	},
	{
		entity: 'Installer',
		formatSpecifier: '.3s',
		id: 'installers_dropped_certifications',
		label: 'Amount of expired certificates',
		title: 'Amount of expired certificates ',
		type: 'count'
	},
	{
		entity: 'Installer',
		formatSpecifier: '.3s',
		id: 'installers_new_certifications',
		label: 'Amount of new/renewed certificates',
		title: 'Amount of new/renewed certificates',
		type: 'count'
	},

	/* Property */

	{
		entity: 'Property',
		field: 'property_feature_total_floor_area',
		formatSpecifier: '.2s',
		id: 'property_feature_total_floor_area_sum',
		isAdditive: true,
		label: 'Total floor area',
		type: 'count',
		unitOfMeasure: 'm^2',
	},
	{
		entity: 'Property',
		field: 'property_supply_photovoltaic',
		formatSpecifier: '.3s',
		id: 'property_supply_photovoltaic_sum',
		isAdditive: true,
		label: 'Total photovoltaic supply',
		type: 'count',
		unitOfMeasure: 'kW',
	},
];
