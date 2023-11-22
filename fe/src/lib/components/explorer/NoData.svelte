<script>
	import {CenteredView, Pill} from '@svizzle/ui';

	import {noDataMessage} from '$lib/config/text.js';
	import {_currThemeVars, _pillTheme} from '$lib/stores/theme.js';
</script>

<CenteredView
	backgroundColor={$_currThemeVars['--colorBackground']}
>
	<Pill
		label={noDataMessage}
		theme={{
			...$_pillTheme,
			fontSize: '1.1em'
		}}
	/>
</CenteredView>
