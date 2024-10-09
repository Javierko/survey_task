<script lang="ts">
	import type { User } from '$lib/database/models/User';
	import userRepository from '$lib/database/repositories/user.repository';
	import { onMount } from 'svelte';
	import { createTable, Render, Subscribe, createRender, DataBodyRow } from 'svelte-headless-table';
	import {
		addPagination,
		addSortBy,
		addSelectedRows,
		type AnyPlugins
	} from 'svelte-headless-table/plugins';
	import { writable } from 'svelte/store';
	import * as Table from '$lib/shadcn/ui/table';
	import { Button } from '$lib/shadcn/ui/button';
	import Icon from '@iconify/svelte';
	import DataTableCheckbox from './data-table-checkbox.svelte';
	import { downloadData } from '$lib/utils/downloadSurveyData';

	let data = writable<User[]>([]);
	const table = createTable(data, {
		page: addPagination(),
		sort: addSortBy({ disableMultiSort: true }),
		select: addSelectedRows()
	});

	onMount(async () => {
		data.set(await userRepository.getAll());
	});

	const columns = table.createColumns([
		table.column({
			id: 'checkbox',
			accessor: 'id',
			header: (_, { pluginStates }) => {
				const { allPageRowsSelected } = pluginStates.select;
				return createRender(DataTableCheckbox, {
					checked: allPageRowsSelected
				});
			},
			cell: ({ row }, { pluginStates }) => {
				const { getRowState } = pluginStates.select;
				const { isSelected } = getRowState(row);

				return createRender(DataTableCheckbox, {
					checked: isSelected
				});
			},
			plugins: {
				sort: {
					disable: true
				}
			}
		}),
		table.column({
			id: 'id',
			accessor: ({ id }) => id,
			header: 'Id',
			plugins: {
				sort: {
					disable: true
				}
			}
		}),
		table.column({
			id: 'identifier',
			accessor: ({ identifier }) => identifier,
			header: 'Identifikátor'
		}),
		table.column({
			id: 'timestamp',
			accessor: 'timestamp',
			header: 'Vytvořen',
			cell: ({ value }) => {
				const date = new Date(value).toLocaleDateString('cs-CZ');
				return date;
			}
		})
	]);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates, rows } =
		table.createViewModel(columns);
	const { hasNextPage, hasPreviousPage, pageIndex } = pluginStates.page;
	const { selectedDataIds } = pluginStates.select;

	const handleDownloadButton = () => {
		const selectedData = $rows.filter((row) => $selectedDataIds[row.id]);

		const userIds = selectedData.reduce((acc, row) => {
			const userId = (row as unknown as DataBodyRow<User, AnyPlugins>).original.id;

			if (!userId) {
				return acc;
			}

			return [...acc, userId];
		}, [] as string[]);

		downloadData(userIds);
	};
</script>

<div class="w-full">
	<div class="rounded-md border">
		<Table.Root {...$tableAttrs}>
			<Table.Header>
				{#each $headerRows as headerRow}
					<Subscribe rowAttrs={headerRow.attrs()}>
						<Table.Row>
							{#each headerRow.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
									<Table.Head {...attrs} class="[&:has([role=checkbox])]:pl-3">
										{#if cell.id === 'id' || cell.id === 'timestamp'}
											<Button variant="ghost" on:click={props.sort.toggle}>
												<Render of={cell.render()} />
												<Icon icon="lucide:arrow-up-down" class="ml-2 h-4 w-4" />
											</Button>
										{:else}
											<Render of={cell.render()} />
										{/if}
									</Table.Head>
								</Subscribe>
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Header>
			<Table.Body {...$tableBodyAttrs}>
				{#each $pageRows as row (row.id)}
					<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
						<Table.Row {...rowAttrs} data-state={$selectedDataIds[row.id] && 'selected'}>
							{#each row.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} let:attrs>
									<Table.Cell {...attrs}>
										<Render of={cell.render()} />
									</Table.Cell>
								</Subscribe>
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	<div class="flex items-center justify-end space-x-4 py-4">
		<div class="flex-1 text-sm text-muted-foreground">
			{Object.keys($selectedDataIds).length} z{' '}
			{$rows.length} řádků zaškrtnuto.
		</div>

		<Button
			size="sm"
			on:click={handleDownloadButton}
			disabled={Object.keys($selectedDataIds).length <= 0}
		>
			Stáhnout
		</Button>

		<Button
			variant="outline"
			size="sm"
			on:click={() => ($pageIndex = $pageIndex - 1)}
			disabled={!$hasPreviousPage}>Předchozí</Button
		>
		<Button
			variant="outline"
			size="sm"
			disabled={!$hasNextPage}
			on:click={() => ($pageIndex = $pageIndex + 1)}>Další</Button
		>
	</div>
</div>
