import type { Route } from "./+types/_index";
import { Welcome } from "../welcome/welcome";
import { asyncPipe } from "~/utils/async-pipe";
import { routeByAuthIntent, withRegisterData } from "~/functions/register-pipe";

export const action = asyncPipe(withRegisterData, routeByAuthIntent);

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Spaß mit Lernquiz!" },
    { name: "description", content: "Spaß mit Lernquiz!" },
  ];
}

export default function Home() {
  return <Welcome />;
}
