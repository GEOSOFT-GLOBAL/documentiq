import { useState, useEffect, useCallback } from "react";
import {
  Search as SearchIcon,
  Mic,
  Clock,
  TrendingUp,
  Loader2,
  FileText,
  CheckCircle,
  XCircle,
  ExternalLink,
  Archive,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSocket } from "@/config/socket";
import type { IContract } from "@/interface/contract";

interface SearchResult extends IContract {
  _id: string;
  media?: Array<{
    url: string;
    filename: string;
    originalName: string;
  }>;
  zipUrl?: string | null;
}

const recentSearches = [
  "SEPLAT drilling contracts 2023",
  "Offshore maintenance services",
  "NNPC wireline agreements",
];

const trendingSearches = [
  "Environmental compliance contracts",
  "Subsea installation services",
  "Pipeline maintenance 2024",
];

const Search = () => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchStatus, setSearchStatus] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    socket.on("contract:search:start", (data: { message: string }) => {
      setSearchStatus(data.message);
      setResults([]);
    });

    socket.on(
      "contract:search:progress",
      (data: { message: string; count: number }) => {
        setSearchStatus(data.message);
      }
    );

    socket.on("contract:search:result", (data: { contract: SearchResult }) => {
      setResults((prev) => [...prev, data.contract]);
    });

    socket.on(
      "contract:search:complete",
      (data: { message: string; total: number }) => {
        setSearchStatus(`${data.total} results found`);
        setIsSearching(false);
      }
    );

    socket.on("contract:search:error", (data: { message: string }) => {
      setSearchStatus(`Error: ${data.message}`);
      setIsSearching(false);
    });

    return () => {
      socket.off("contract:search:start");
      socket.off("contract:search:progress");
      socket.off("contract:search:result");
      socket.off("contract:search:complete");
      socket.off("contract:search:error");
    };
  }, []);

  const handleSearch = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!query.trim()) return;

      const socket = getSocket();
      setIsSearching(true);
      setHasSearched(true);
      setResults([]);
      setSearchStatus("Connecting...");

      socket.emit("contract:search", { query: query.trim() });
    },
    [query]
  );

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-3.5rem)] px-4 py-8">
      <div className="w-full max-w-3xl space-y-6">
        {/* Logo/Title */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">DocQuery</h1>
          <p className="text-muted-foreground">
            Search contracts, documents, and more
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative">
          <div className="relative flex items-center">
            <SearchIcon className="absolute left-4 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search documents, contracts, operators..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-12 text-base rounded-full border-2 focus-visible:ring-2 focus-visible:ring-primary"
              disabled={isSearching}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 h-8 w-8 rounded-full"
              disabled={isSearching}
            >
              <Mic className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>

          {/* Search Buttons */}
          <div className="flex justify-center gap-3 mt-6">
            <Button type="submit" variant="secondary" disabled={isSearching}>
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search Documents"
              )}
            </Button>
          </div>
        </form>

        {/* Search Status */}
        {searchStatus && (
          <p className="text-center text-sm text-muted-foreground">
            {searchStatus}
          </p>
        )}

        {/* Search Results */}
        {hasSearched && results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Search Results</h2>
            <div className="space-y-3">
              {results.map((contract) => (
                <Card
                  key={contract._id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {contract.hasDocument ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                        ) : (
                          <XCircle className="h-5 w-5 text-muted-foreground mt-1" />
                        )}
                        <div>
                          <h3 className="font-medium">
                            {contract.contractTitle}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {contract.operator} • {contract.contractorName} •{" "}
                            {contract.contractNumber}
                          </p>
                          {contract.media && contract.media.length > 0 && (
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {contract.media.length} document(s)
                                </span>
                                {contract.zipUrl && (
                                  <a
                                    href={contract.zipUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline ml-2"
                                  >
                                    <Archive className="h-3 w-3" />
                                    Download All
                                  </a>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {contract.media.map((doc, idx) => (
                                  <a
                                    key={idx}
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    {doc.originalName || doc.filename}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          ${contract.contractValue?.toLocaleString() || "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {contract.year}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {hasSearched && !isSearching && results.length === 0 && (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No contracts found</p>
          </div>
        )}

        {/* Suggestions - only show when not searched */}
        {!hasSearched && (
          <div className="grid md:grid-cols-2 gap-6 pt-4">
            {/* Recent Searches */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Clock className="h-4 w-4" />
                Recent Searches
              </div>
              <ul className="space-y-2">
                {recentSearches.map((item, index) => (
                  <li key={index}>
                    <button
                      onClick={() => handleSuggestionClick(item)}
                      className="text-sm text-left w-full px-3 py-2 rounded-md hover:bg-muted transition-colors"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trending Searches */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Trending Searches
              </div>
              <ul className="space-y-2">
                {trendingSearches.map((item, index) => (
                  <li key={index}>
                    <button
                      onClick={() => handleSuggestionClick(item)}
                      className="text-sm text-left w-full px-3 py-2 rounded-md hover:bg-muted transition-colors"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
