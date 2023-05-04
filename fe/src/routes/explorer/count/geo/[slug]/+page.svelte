<script>
	import {
		_activeViewType,
		_currentMetric,
		_currentMetricId
	} from '$lib/stores/navigation.js';
</script>

<div>{$_currentMetric.type}: {$_activeViewType}</div>
<div>{$_currentMetricId}</div>
