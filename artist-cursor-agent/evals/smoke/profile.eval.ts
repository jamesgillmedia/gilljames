import { defineEval, includes } from "@cursor/bdk/evals";

export default defineEval({
  tags: ["smoke"],
  cases: [
    {
      id: "about",
      description: "About the artist uses the profile tool.",
      async test(t) {
        await t.send("Who is James Gill? Give a short bio.");
        t.succeeded();
        t.calledTool("get_artist_profile");
        t.notCalledTool("search_works");
        t.check(t.reply, includes(/Gill|James|artist/i));
      },
    },
  ],
});
