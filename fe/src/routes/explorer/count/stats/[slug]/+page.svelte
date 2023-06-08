<script>
	import {MessageView} from '@svizzle/ui';
	import * as _ from 'lamb';

	import {page as _page} from '$app/stores';
	import {_currentMetricId} from '$lib/stores/navigation.js';
	import {_viewData} from '$lib/stores/view.js';
	import {roundTo1} from '$lib/utils/numbers.js';

	const dataAccessors = {
		installations: _.getKey('count'),
		installations_per_installer: _.pipe([_.getPath('stats.avg'), roundTo1]),
		installers: _.getPath('cardinality.value'),
	}

	$: dataAccessor = dataAccessors[$_currentMetricId];
	$: proceed =
		$_viewData?.response.code === 200 &&
		$_page.route.id === $_viewData?.page.route.id;

	let text;
	let value;

	$: if (proceed) {
		value = dataAccessor($_viewData.response.data);

		switch ($_currentMetricId) {
			case 'installations':
				text = `${value} installations for the current filter`;
				break;
			case 'installations_per_installer':
				text = `Average of ${value} installations/installer for the current filter`;
				break;
			case 'installers':
				text = `${value} installers installed heat pumps for the current filter`;
				break;
			default:
				break;
		}
	}
</script>

<MessageView {text} />
