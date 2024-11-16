import SearchForm from "@/components/SearchForm";
import StartupCard, {StartupTypeCard} from "@/components/StartupCard";
import {STARTUPS_QUERY} from "@/sanity/lib/queries";
import {sanityFetch, SanityLive} from "@/sanity/lib/live";
import {auth} from "@/auth";

export default async function Home({searchParams}: {searchParams: Promise<{ query?: string }>})
{

  const query = (await searchParams).query;
  const params = { search: query || null };

  const {data: posts} = await sanityFetch({query: STARTUPS_QUERY, params})

  const session = await auth();

  console.log(session?.id);

  return <>
    <section className="pink_container">
      <h1 className="heading">
        Publish your recipes <br/>
        Сhoose from the best
      </h1>

      <p className="sub-heading !max-w-3xl">
        Create delicious ideas and share them with the whole world
      </p>

      <SearchForm query={query}/>
    </section>

    <section className="section_container">
      <p className="text-30-semibold">
        {query ? `Search results for "${query}"` : "All Recipes"}
      </p>

      <ul className="mt-7 card_grid">
        {posts?.length > 0 ? (
            posts.map((post ) => (
                <StartupCard key={post?._id} post={post as StartupTypeCard} />
            ))
        ) : (
            <p className="no-results">No recipes found</p>
        )}
      </ul>
    </section>

    <SanityLive/>
  </>
}
