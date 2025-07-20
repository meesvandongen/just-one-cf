import { Trans, useLingui } from "@lingui/react/macro";
import {
	Button,
	Card,
	Group,
	Loader,
	Paper,
	Select,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { MdRefresh } from "react-icons/md";
import { WORD_LIST_OPTIONS, estimateWordsNeeded, selectRandomWords, type WordListOption } from "@/utils/wordlist";

interface WordListSelectorProps {
	setTarget: number;
	onWordListSelected: (words: string[]) => void;
	selectedWordListId?: string;
	disabled?: boolean;
}

export const WordListSelector = ({
	setTarget,
	onWordListSelected,
	selectedWordListId,
	disabled = false,
}: WordListSelectorProps) => {
	const { t } = useLingui();
	const [selectedOptionId, setSelectedOptionId] = useState<string>(
		selectedWordListId || WORD_LIST_OPTIONS[0]?.id || ""
	);
	const [isLoading, setIsLoading] = useState(false);
	const [loadedWords, setLoadedWords] = useState<string[]>([]);
	const [error, setError] = useState<string | null>(null);

	const selectedOption = WORD_LIST_OPTIONS.find(opt => opt.id === selectedOptionId);
	const wordsNeeded = estimateWordsNeeded(setTarget);

	// Load the selected word list
	const loadWordList = async (option: WordListOption) => {
		setIsLoading(true);
		setError(null);
		try {
			const words = await option.loadWords();
			setLoadedWords(words);
			// Automatically select random words and notify parent
			const selectedWords = selectRandomWords(words, wordsNeeded);
			onWordListSelected(selectedWords);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load word list');
			setLoadedWords([]);
		} finally {
			setIsLoading(false);
		}
	};

	// Load word list when option changes
	useEffect(() => {
		if (selectedOption) {
			loadWordList(selectedOption);
		}
	}, [selectedOption, setTarget]);

	const handleOptionChange = (value: string | null) => {
		if (value) {
			setSelectedOptionId(value);
		}
	};

	const handleRefresh = () => {
		if (selectedOption && loadedWords.length > 0) {
			const selectedWords = selectRandomWords(loadedWords, wordsNeeded);
			onWordListSelected(selectedWords);
		}
	};

	return (
		<Paper p="md" withBorder>
			<Stack gap="md">
				<Title order={3}>
					<Trans>Word List Selection</Trans>
				</Title>

				<Select
					label={<Trans>Choose Word List</Trans>}
					data={WORD_LIST_OPTIONS.map(option => ({
						value: option.id,
						label: option.name,
					}))}
					value={selectedOptionId}
					onChange={handleOptionChange}
					disabled={disabled || isLoading}
				/>

				{selectedOption && (
					<Card withBorder bg="gray.0">
						<Text size="sm" fw={500}>
							{selectedOption.name}
						</Text>
						<Text size="xs" c="dimmed">
							{selectedOption.description}
						</Text>
					</Card>
				)}

				{isLoading && (
					<Group gap="xs">
						<Loader size="sm" />
						<Text size="sm" c="dimmed">
							<Trans>Loading word list...</Trans>
						</Text>
					</Group>
				)}

				{error && (
					<Text size="sm" c="red">
						<Trans>Error: {error}</Trans>
					</Text>
				)}

				{loadedWords.length > 0 && !isLoading && (
					<>
						<Group justify="space-between" align="center">
							<Text size="sm" c="dimmed">
								<Trans>
									Loaded {loadedWords.length.toLocaleString()} words
									<br />
									Selected {wordsNeeded} for this game
								</Trans>
							</Text>
							<Button
								size="xs"
								variant="light"
								leftSection={<MdRefresh />}
								onClick={handleRefresh}
								disabled={disabled}
							>
								<Trans>New Selection</Trans>
							</Button>
						</Group>
					</>
				)}
			</Stack>
		</Paper>
	);
};