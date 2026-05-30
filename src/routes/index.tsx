import * as fs from "node:fs";

import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

const filePath = "count.txt";

async function readCount() {
  return Number.parseInt(
    await fs.promises.readFile(filePath, "utf-8").catch(() => "0"),
    10,
  );
}

const getCount = createServerFn({
  method: "GET",
}).handler(() => {
  return readCount();
});

const updateCount = createServerFn({ method: "POST" })
  .inputValidator((data: number) => data)
  .handler(async ({ data }) => {
    const count = await readCount();
    await fs.promises.writeFile(filePath, `${count + data}`);
  });

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => await getCount(),
});

function Home() {
  const router = useRouter();
  const count = Route.useLoaderData();

  return (
    <main className="shell">
      <section className="intro">
        <p className="eyebrow">TanStack Start</p>
        <h1>Credit card offer workspace</h1>
        <p>
          A tiny full-stack starter route is alive. The button below updates a
          server-side counter, then refreshes the route loader.
        </p>
      </section>

      <button
        className="counter"
        type="button"
        onClick={() => {
          updateCount({ data: 1 }).then(() => {
            router.invalidate();
          });
        }}
      >
        Add 1 to {count}
      </button>
    </main>
  );
}
