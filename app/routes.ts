import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
          //path , //file
    route("/auth", "routes/auth.tsx"),
    route("/upload", "routes/upload.tsx"),

] satisfies RouteConfig;
