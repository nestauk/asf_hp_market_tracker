<script>
	import {Icon, HyperLink, Info, Send} from '@svizzle/ui';

	import {
		_currThemeVars,
		_getNavLinkColor,
		_linkTheme0,
	} from '$lib/stores/theme.js';

	export let segment;
</script>

<nav
	class='NavMedium'
	role='none'
>
	<menu>
		<div role='none'>
			<ul role='none'>
				<li role='none'>
					<HyperLink
						href='/'
						theme={{
							...$_linkTheme0,
							color: $_getNavLinkColor(segment, ''),
						}}
					>
						Home
					</HyperLink>
				</li>
				<li role='none'>
					<HyperLink
						href='/methodology'
						theme={{
							...$_linkTheme0,
							color: $_getNavLinkColor(segment, 'methodology'),
						}}
					>
						Methodology
					</HyperLink>
				</li>
				<li role='none'>
					<HyperLink
						href='/guides'
						theme={{
							...$_linkTheme0,
							color: $_getNavLinkColor(segment, 'guides'),
						}}
					>
						Guides
					</HyperLink>
				</li>
				<li role='none'>
					<HyperLink
						href='/explorer'
						theme={{
							...$_linkTheme0,
							color: $_getNavLinkColor(segment, 'explorer'),
						}}
					>
						Explorer
					</HyperLink>
				</li>
			</ul>
		</div>
		<div role='none'>
			<ul role='none'>
				<li role='none'>
					<HyperLink
						href='/feedback'
						rel='prefetch'
						theme={{
							...$_linkTheme0,
							color: $_getNavLinkColor(segment, 'feedback'),
						}}
					>
						Feedback
						<Icon
							glyph={Send}
							size=20
							stroke={$_currThemeVars['--colorIcon']}
							strokeWidth=1.5
						/>
					</HyperLink>
				</li>
				<li role='none'>
					<HyperLink
						href='/info'
						rel='prefetch'
						theme={{
							...$_linkTheme0,
							color: $_getNavLinkColor(segment, 'info'),
						}}
					>
						Info
						<Icon
							glyph={Info}
							size=20
							strokeWidth=1.5
							stroke={$_currThemeVars['--colorIcon']}
						/>
					</HyperLink>
				</li>
			</ul>
		</div>
	</menu>
</nav>

<style>
	nav, menu {
		align-items: center;
		display: flex;
		height: 100%;
		width: 100%;
	}
	nav {
		gap: 12px;
		justify-content: end; /* Align to the right on Firefox */
		justify-content: flex-end; /* Align to the right on Chrome */
		position: relative;
	}
	menu {
		background: var(--colorBackground);
		flex-direction: row;
		height: 100%;
		justify-content: space-between;
		left: 0;
		top: 0;
		width: 100%;
	}
	ul {
		align-items: center;
		display: flex;
		flex-direction: row;
		margin: 0;
		padding: 0;
	}
	li {
		display: block;
		padding: 0 0.5em;
		white-space: nowrap;
	}
</style>
