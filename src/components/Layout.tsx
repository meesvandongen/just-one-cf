interface LayoutProps {
	children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
	return (
		<main className="flex flex-col items-center h-screen bg-stone-300 w-screen py-6 px-8 font-sans">
			<section className="border border-black rounded p-5 shadow bg-stone-50 w-full md:max-w-4xl">
				{children}
			</section>
		</main>
	);
};

export default Layout;
