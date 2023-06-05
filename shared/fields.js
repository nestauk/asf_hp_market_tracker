export const fields = [

	/* Heat pump */

	{
		entity: 'Heat pump',
		id: 'hp_feature_design',
		label: 'Design',
		type: 'category',
	},
	{
		entity: 'Heat pump',
		id: 'hp_feature_flow_temperature',
		label: 'Flow temperature',
		type: 'number',
		unitOfMeasure: '°C',
	},
	{
		entity: 'Heat pump',
		id: 'hp_feature_heat_system',
		label: 'Heat system',
		type: 'category',
	},
	{
		entity: 'Heat pump',
		id: 'hp_feature_power_capacity',
		label: 'Power capacity',
		type: 'number',
		unitOfMeasure: 'kW',
	},
	{
		entity: 'Heat pump',
		id: 'hp_feature_power_generation',
		label: 'Power generation',
		type: 'number',
		unitOfMeasure: 'kW',
	},
	{
		entity: 'Heat pump',
		id: 'hp_feature_scop',
		label: 'SCOP',
		longLabel: 'Seasonal Coefficient of Performance',
		type: 'number',
	},
	{
		entity: 'Heat pump',
		id: 'hp_id_brand',
		label: 'Brand',
		type: 'string',
	},
	{
		entity: 'Heat pump',
		id: 'hp_id_model',
		label: 'Model',
		type: 'string',
	},

	/* Installation */

	{
		entity: 'Installation',
		id: 'installation_cost',
		label: 'Cost',
		type: 'number',
		unitOfMeasure: 'GBP',
	},
	{
		entity: 'Installation',
		id: 'installation_date',
		type: 'date',
		use: 'time',
	},

	/* Installer */

	{
		entity: 'Installer',
		id: 'installer_certificate_date_end',
		type: 'date',
		use: 'time',
	},
	{
		entity: 'Installer',
		id: 'installer_certificate_date_start',
		type: 'date',
		use: 'time',
	},
	{
		entity: 'Installer',
		id: 'installer_geo_region_country', // TBD rename to installer_geo_region_country_name
		type: 'category',
		use: 'regionId',
	},
	{
		entity: 'Installer',
		id: 'installer_geo_region_itl21_1_id',
		type: 'string',
		use: 'regionId',
	},
	{
		entity: 'Installer',
		id: 'installer_geo_region_itl21_1_name',
		type: 'string',
		use: 'regionName',
	},
	{
		entity: 'Installer',
		id: 'installer_geo_region_itl21_2_id',
		type: 'string',
		use: 'regionId',
	},
	{
		entity: 'Installer',
		id: 'installer_geo_region_itl21_2_name',
		type: 'string',
		use: 'regionName',
	},
	{
		entity: 'Installer',
		id: 'installer_geo_region_itl21_3_id',
		type: 'string',
		use: 'regionId',
	},
	{
		entity: 'Installer',
		id: 'installer_geo_region_itl21_3_name',
		type: 'string',
		use: 'regionName',
	},
	{
		entity: 'Installer',
		id: 'installer_geo_region_lau21_1_id',
		type: 'string',
		use: 'regionId',
	},
	{
		entity: 'Installer',
		id: 'installer_geo_region_lau21_1_name',
		type: 'string',
		use: 'regionName',
	},
	{
		entity: 'Installer',
		id: 'installer_geo_region_lsoa11_id',
		type: 'string',
		use: 'regionId',
	},
	{
		entity: 'Installer',
		id: 'installer_geo_region_lsoa11_name',
		type: 'string',
		use: 'regionName',
	},
	{
		entity: 'Installer',
		id: 'installer_geo_region_msoa11_id',
		type: 'string',
		use: 'regionId',
	},
	{
		entity: 'Installer',
		id: 'installer_geo_region_msoa11_name',
		type: 'string',
		use: 'regionName',
	},
	{
		entity: 'Installer',
		id: 'installer_id_hash',
		type: 'string',
		use: 'installerId'
	},

	/* Property */

	{
		entity: 'Property',
		id: 'property_energy_efficiency_floor',
		label: 'Floor energy efficiency',
		type: 'category',
	},
	{
		entity: 'Property',
		id: 'property_energy_efficiency_hot_water',
		label: 'Hot water energy efficiency',
		type: 'category',
	},
	{
		entity: 'Property',
		id: 'property_energy_efficiency_lighting',
		label: 'Lighting energy efficiency',
		type: 'category',
	},
	{
		entity: 'Property',
		id: 'property_energy_efficiency_main_heat',
		label: 'Main heat energy efficiency',
		type: 'category',
	},
	{
		entity: 'Property',
		id: 'property_energy_efficiency_roof',
		label: 'Roof heat energy efficiency',
		type: 'category',
	},
	{
		entity: 'Property',
		id: 'property_energy_efficiency_walls',
		label: 'Walls heat energy efficiency',
		type: 'category',
	},
	{
		entity: 'Property',
		id: 'property_energy_efficiency_windows',
		label: 'Windows heat energy efficiency',
		type: 'category',
	},
	{
		entity: 'Property',
		id: 'property_energy_rating_current',
		label: 'Current energy rating',
		type: 'category',
	},
	{
		entity: 'Property',
		id: 'property_energy_rating_potential',
		label: 'Potential energy rating',
		type: 'category',
	},
	{
		entity: 'Property',
		id: 'property_feature_age_band',
		label: 'Age band',
		type: 'category',
	},
	{
		entity: 'Property',
		id: 'property_feature_built_form',
		label: 'Built form',
		type: 'category',
	},
	{
		entity: 'Property',
		id: 'property_feature_glazed_area',
		label: 'Glazed area',
		type: 'number',
		unitOfMeasure: 'm^2',
	},
	{
		entity: 'Property',
		id: 'property_feature_glazed_type',
		label: 'Glazed type',
		type: 'category',
	},
	{
		entity: 'Property',
		id: 'property_feature_number_habitable_rooms',
		label: 'Number of habitable rooms',
		type: 'number',
	},
	{
		entity: 'Property',
		id: 'property_feature_total_floor_area',
		label: 'Floor area',
		type: 'number',
		unitOfMeasure: 'm^2',
	},
	{
		entity: 'Property',
		id: 'property_feature_type',
		label: 'Type',
		type: 'category',
	},
	{
		entity: 'Property',
		id: 'property_geo_region_country', // TBD rename to property_geo_region_country_name
		type: 'category',
		use: 'regionName',
	},
	{
		entity: 'Property',
		id: 'property_geo_region_itl21_1_id',
		type: 'string',
		use: 'regionId',
	},
	{
		entity: 'Property',
		id: 'property_geo_region_itl21_1_name',
		type: 'string',
		use: 'regionName',
	},
	{
		entity: 'Property',
		id: 'property_geo_region_itl21_2_id',
		type: 'string',
		use: 'regionId',
	},
	{
		entity: 'Property',
		id: 'property_geo_region_itl21_2_name',
		type: 'string',
		use: 'regionName',
	},
	{
		entity: 'Property',
		id: 'property_geo_region_itl21_3_id',
		type: 'string',
		use: 'regionId',
	},
	{
		entity: 'Property',
		id: 'property_geo_region_itl21_3_name',
		type: 'string',
		use: 'regionName',
	},
	{
		entity: 'Property',
		id: 'property_geo_region_lau21_1_id',
		type: 'string',
		use: 'regionId',
	},
	{
		entity: 'Property',
		id: 'property_geo_region_lau21_1_name',
		type: 'string',
		use: 'regionName',
	},
	{
		entity: 'Property',
		id: 'property_geo_region_lsoa11_id',
		type: 'string',
		use: 'regionId',
	},
	{
		entity: 'Property',
		id: 'property_geo_region_lsoa11_name',
		type: 'string',
		use: 'regionName',
	},
	{
		entity: 'Property',
		id: 'property_geo_region_msoa11_id',
		type: 'string',
		use: 'regionId',
	},
	{
		entity: 'Property',
		id: 'property_geo_region_msoa11_name',
		type: 'string',
		use: 'regionName',
	},
	{
		entity: 'Property',
		id: 'property_supply_heating_fuel_type',
		label: 'Heating fuel type',
		type: 'category',
	},
	{
		entity: 'Property',
		id: 'property_supply_heating_system',
		label: 'Heating system',
		type: 'category',
	},
	{
		entity: 'Property',
		id: 'property_supply_mains_gas_flag',
		label: 'Heating mains gas?',
		type: 'category',
	},
	{
		entity: 'Property',
		id: 'property_supply_photovoltaic',
		label: 'Photovoltaic supply',
		type: 'number',
		unitOfMeasure: 'kW',
	},
	{
		entity: 'Property',
		id: 'property_supply_solar_water_heating_flag',
		label: 'Solar water heating?',
		type: 'category',
	},
	{
		entity: 'Property',
		id: 'property_tenure',
		label: 'Tenure',
		type: 'category',
	},
];
