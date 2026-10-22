import { defineEval, includes } from "@cursor/bdk/evals";

export default defineEval({
  tags: ["smoke"],
  cases: [
    {
      id: "bmw",
      description: "BMW credit lookup uses search_works.",
      async test(t) {
        await t.send("Which BMW films are in the catalog? List titles and links.");
        t.succeeded();
        t.calledTool("search_works");
        t.check(t.reply, includes(/BMW/i));
      },
    },
  ],
});
