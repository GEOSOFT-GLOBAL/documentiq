import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History as HistoryIcon, Clock, FileText, ArrowRightLeft, Sparkles } from "lucide-react";

const History = () => {
  // Placeholder history data - can be connected to actual storage later
  const historyItems = [
    { id: 1, action: "Converted Markdown to HTML", time: "2 hours ago", icon: ArrowRightLeft },
    { id: 2, action: "Generated QR Code", time: "3 hours ago", icon: HistoryIcon },
    { id: 3, action: "Summarized text", time: "5 hours ago", icon: Sparkles },
    { id: 4, action: "Converted CSV to Table", time: "1 day ago", icon: FileText },
  ];

  return (
    <div className="h-full flex flex-col p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">History</h1>
        <p className="text-muted-foreground">
          View your recent activities and conversions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historyItems.length > 0 ? (
            <div className="space-y-4">
              {historyItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="p-2 rounded-full bg-primary/10">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <HistoryIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No history yet</p>
              <p className="text-sm">Your activities will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default History;
