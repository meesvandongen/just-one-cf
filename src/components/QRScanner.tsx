import { Trans } from "@lingui/react/macro";
import { Button, Modal, Stack, Text } from "@mantine/core";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useState } from "react";

interface QRScannerProps {
	isOpen: boolean;
	onClose: () => void;
	onScan: (data: string) => void;
}

export default function QRScanner({ isOpen, onClose, onScan }: QRScannerProps) {
	const [error, setError] = useState<string>("");

	const handleScan = (result: any) => {
		if (result && result.length > 0) {
			const text = result[0]?.rawValue || "";
			
			// Try to extract room code from different QR code formats
			let roomCode = "";
			
			// If it's a URL with join parameter
			try {
				const url = new URL(text);
				const joinParam = url.searchParams.get("join");
				if (joinParam && joinParam.length === 8) {
					roomCode = joinParam.toUpperCase();
				}
			} catch {
				// If not a URL, check if it's a direct 8-character room code
				if (text.length === 8 && /^[A-Z0-9]+$/i.test(text)) {
					roomCode = text.toUpperCase();
				}
			}
			
			if (roomCode) {
				onScan(roomCode);
				onClose();
			} else {
				setError("Invalid QR code. Please scan a valid room code or join link.");
			}
		}
	};

	const handleError = (error: any) => {
		console.error("QR Scanner error:", error);
		setError("Camera access failed. Please check permissions.");
	};

	const handleClose = () => {
		setError("");
		onClose();
	};

	return (
		<Modal
			opened={isOpen}
			onClose={handleClose}
			title={<Trans>Scan QR Code</Trans>}
			centered
			size="md"
		>
			<Stack gap="md">
				<Text size="sm" c="dimmed">
					<Trans>Point your camera at a QR code to automatically enter the room code</Trans>
				</Text>
				
				{isOpen && (
					<div style={{ position: "relative", width: "100%", height: "300px" }}>
						<Scanner
							onScan={handleScan}
							onError={handleError}
							formats={["qr_code"]}
							constraints={{
								facingMode: "environment", // Use back camera by default
							}}
							styles={{
								container: {
									width: "100%",
									height: "100%",
								},
							}}
						/>
					</div>
				)}
				
				{error && (
					<Text size="sm" c="red">
						{error}
					</Text>
				)}
				
				<Button variant="light" onClick={handleClose} fullWidth>
					<Trans>Cancel</Trans>
				</Button>
			</Stack>
		</Modal>
	);
}