import Bookmarks from "@/views/app/bookmarks";
import Document from "@/views/app/documents";
import History from "@/views/app/history";
import Query from "@/views/app/query";
import Search from "@/views/app/search";
import Setting from "@/views/app/settings";

export const appRoutes = [
  {
    index: true,
    element: <Search />,
  },
  {
    path: "query",
    element: <Query />,
  },
  {
    path: "history",
    element: <History />,
  },
  {
    path: "documents",
    element: <Document />,
  },
  {
    path: "bookmarks",
    element: <Bookmarks />,
  },
  {
    path: "settings",
    element: <Setting />,
  },
];
