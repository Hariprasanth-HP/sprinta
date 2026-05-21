import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { Toaster } from "@/components/ui/sonner";
import App from "@/app/App";
import store from "./store";
import { SearchProvider } from "./contexts/search-context";

const root = createRoot(document.getElementById("root")!);
const queryClient = new QueryClient();
root.render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<Provider store={store}>
				<SearchProvider>
					<App />
					<Toaster />
				</SearchProvider>
			</Provider>
		</QueryClientProvider>
	</React.StrictMode>,
);
