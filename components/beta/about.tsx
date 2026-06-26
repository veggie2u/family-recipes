export function About() {
  return (
    <div className="py-4">
      <h1 className="text-3xl font-bold mb-2">Welcome to Family Recipes — Beta</h1>
      <p className="text-muted-foreground mb-4">
        Family Recipes is currently in beta. We&apos;re actively building and improving the app,
        so you may notice changes to navigation, layout, and features as we work toward a full
        release. We appreciate your patience and feedback along the way.
      </p>
      <p className="text-sm text-muted-foreground bg-muted px-4 py-3 rounded-md mb-8">
        <strong>Note:</strong> Sign-ups are temporarily disabled while we confirm and test the
        sign-up flow. We&apos;ll open registration back up soon.
      </p>

      <h2 className="text-xl font-semibold mb-4">What&apos;s Inside</h2>
      <div className="flex flex-col gap-6 mb-10">
        <div>
          <h3 className="font-semibold mb-1">Feed</h3>
          <p className="text-sm text-muted-foreground">
            Your home base — a live stream of recipes and cookbooks shared by the community,
            the families you belong to, and the people and cookbooks you follow. Filter by All,
            My Families, Following, or Public, and search directly from the feed to discover
            new recipes, cookbooks, and people.
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-1">Cookbooks</h3>
          <p className="text-sm text-muted-foreground">
            Curated collections of recipes you create and organize however you like — by cuisine,
            occasion, season, or any theme that works for you. Cookbooks can be public for the
            community to discover and follow, or kept private within your family.
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-1">Families</h3>
          <p className="text-sm text-muted-foreground">
            Private groups for sharing recipes with the people who matter most. Create a family,
            invite members, and build a shared collection of cookbooks and recipes together.
            Family content stays within your group unless you choose to make it public.
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-1">Recipes</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage your own recipes with ingredients, instructions, and tags. Keep
            them private, share with a family, or make them public for the whole community to enjoy.
          </p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-2">Still to Come</h2>
      <p className="text-sm text-muted-foreground">
        We have more features on the way. Leave feedback using the button in the banner above
        — we read everything.
      </p>
    </div>
  );
}
