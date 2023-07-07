export const schema = {
	hp_feature_design: {
		type: 'terms',
		name: 'hp_feature_design.keyword'
	},
	hp_feature_flow_temperature: {
		type: 'range'
	},
	hp_feature_heat_source: {
		type: 'terms',
		name: 'hp_feature_heat_source.keyword'
	},
	hp_feature_heat_system: {
		type: 'terms',
		name: 'hp_feature_heat_system.keyword'
	},
	hp_feature_power_capacity: {
		type: 'range'
	},
	hp_feature_power_generation: {
		type: 'range'
	},
	hp_feature_scop: {
		type: 'range'
	},
	hp_id_brand: {
		type: 'terms',
		name: 'hp_id_brand.keyword'
	},
	hp_id_model: {
		type: 'terms',
		name: 'hp_id_model.keyword'
	},
	installation_cost: {
		type: 'range'
	},
	installation_date: {
		type: 'range'
	},
	installation_date_month: {
		type: 'range'
	},
	installation_date_year: {
		type: 'range'
	},
	installer_certificate_date_end: {
		type: 'range'
	},
	installer_certificate_date_start: {
		type: 'range'
	},
	installer_geo_region_country21_name: {
		type: 'terms',
		name: 'installer_geo_region_country21_name.keyword'
	},
	installer_geo_region_itl21_1_id: {
		type: 'terms',
		name: 'installer_geo_region_itl21_1_id.keyword'
	},
	installer_geo_region_itl21_1_name: {
		type: 'terms',
		name: 'installer_geo_region_itl21_1_name.keyword'
	},
	installer_geo_region_itl21_2_id: {
		type: 'terms',
		name: 'installer_geo_region_itl21_2_id.keyword'
	},
	installer_geo_region_itl21_2_name: {
		type: 'terms',
		name: 'installer_geo_region_itl21_2_name.keyword'
	},
	installer_geo_region_itl21_3_id: {
		type: 'terms',
		name: 'installer_geo_region_itl21_3_id.keyword'
	},
	installer_geo_region_itl21_3_name: {
		type: 'terms',
		name: 'installer_geo_region_itl21_3_name.keyword'
	},
	installer_geo_region_lau21_1_id: {
		type: 'terms',
		name: 'installer_geo_region_lau21_1_idkeyword'
	},
	installer_geo_region_lau21_1_name: {
		type: 'terms',
		name: 'installer_geo_region_lau21_1_id.keyword'
	},
	installer_geo_region_lsoa11_id: {
		type: 'terms',
		name: 'installer_geo_region_lsoa11_id.keyword'
	},
	installer_geo_region_lsoa11_name: {
		type: 'terms',
		name: 'installer_geo_region_lsoa11_name.keyword'
	},
	installer_geo_region_msoa11_id: {
		type: 'terms',
		name: 'installer_geo_region_msoa11_id.keyword'
	},
	installer_geo_region_msoa11_name: {
		type: 'terms',
		name: 'installer_geo_region_msoa11_name.keyword'
	},
	installer_geo_town: {
		type: 'terms',
		name: 'installer_geo_town.keyword'
	},
	property_geo_region_country21_name: {
		type: 'terms',
		name: 'property_geo_region_country21_name.keyword'
	},
	property_geo_region_itl21_1_id: {
		type: 'terms',
		name: 'property_geo_region_itl21_1_id.keyword'
	},
	property_geo_region_itl21_1_name: {
		type: 'terms',
		name: 'property_geo_region_itl21_1_name.keyword'
	},
	property_geo_region_itl21_2_id: {
		type: 'terms',
		name: 'property_geo_region_itl21_2_id.keyword'
	},
	property_geo_region_itl21_2_name: {
		type: 'terms',
		name: 'property_geo_region_itl21_2_name.keyword'
	},
	property_geo_region_itl21_3_id: {
		type: 'terms',
		name: 'property_geo_region_itl21_3_id.keyword'
	},
	property_geo_region_itl21_3_name: {
		type: 'terms',
		name: 'property_geo_region_itl21_3_name.keyword'
	},
	property_geo_region_lau21_1_id: {
		type: 'terms',
		name: 'property_geo_region_lau21_1_id.keyword'
	},
	property_geo_region_lau21_1_name: {
		type: 'terms',
		name: 'property_geo_region_lau21_1_name.keyword'
	},
	property_geo_region_lsoa11_id: {
		type: 'terms',
		name: 'property_geo_region_lsoa11_id.keyword'
	},
	property_geo_region_lsoa11_name: {
		type: 'terms',
		name: 'property_geo_region_lsoa11_name.keyword'
	},
	property_geo_region_msoa11_id: {
		type: 'terms',
		name: 'property_geo_region_msoa11_id.keyword'
	},
	property_geo_region_msoa11_name: {
		type: 'terms',
		name: 'property_geo_region_msoa11_name.keyword'
	},
	property_energy_efficiency_floor: {
		type: 'terms',
		name: 'property_energy_efficiency_floor.keyword'
	},
	property_energy_efficiency_hot_water: {
		type: 'terms',
		name: 'property_energy_efficiency_hot_water.keyword'
	},
	property_energy_efficiency_lighting: {
		type: 'terms',
		name: 'property_energy_efficiency_lighting.keyword'
	},
	property_energy_efficiency_main_heat: {
		type: 'terms',
		name: 'property_energy_efficiency_lighting.keyword'
	},
	property_energy_efficiency_roof: {
		type: 'terms',
		name: 'property_energy_efficiency_roof.keyword'
	},
	property_energy_efficiency_walls: {
		type: 'terms',
		name: 'property_energy_efficiency_walls.keyword'
	},
	property_energy_efficiency_windows: {
		type: 'terms',
		name: 'property_energy_efficiency_windows.keyword'
	},
	property_energy_rating_current: {
		type: 'terms',
		name: 'property_energy_rating_current.keyword'
	},
	property_energy_rating_potential: {
		type: 'terms',
		name: 'property_energy_rating_potential.keyword'
	},
	property_feature_age_band: {
		type: 'terms',
		name: 'property_feature_age_band.keyword'
	},
	property_feature_built_form: {
		type: 'terms',
		name: 'property_feature_built_form.keyword'
	},
	property_feature_glazed_area: {
		type: 'range'
	},
	property_feature_glazed_type: {
		type: 'terms',
		name: 'property_feature_built_form.keyword'
	},
	property_feature_number_habitable_rooms: {
		type: 'range'
	},
	property_feature_total_floor_area: {
		type: 'range'
	},
	property_feature_type: {
		type: 'terms',
		name: 'property_feature_type.keyword'
	},
	property_supply_heating_fuel_type: {
		type: 'terms',
		name: 'property_supply_heating_fuel_type.keyword'
	},
	property_supply_heating_system: {
		type: 'terms',
		name: 'property_supply_heating_system.keyword'
	},
	property_supply_mains_gas_flag: {
		type: 'terms',
		name: 'property_supply_mains_gas_flag.keyword'
	},
	property_supply_photovoltaic: {
		type: 'range'
	},
	property_supply_solar_water_heating_flag: {
		type: 'terms',
		name: 'property_supply_solar_water_heating_flag.keyword'
	},
	property_tenure: {
		type: 'terms',
		name: 'property_tenure.keyword'
	}
};
