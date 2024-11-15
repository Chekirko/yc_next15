import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google";
import {AUTHOR_BY_GOOGLE_ID_QUERY} from "@/sanity/lib/queries";
import {client} from "@/sanity/lib/client";
import {writeClient} from "@/sanity/lib/write-client";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user, profile })  {
            const existingUser = await client
                .withConfig({ useCdn: false })
                .fetch(AUTHOR_BY_GOOGLE_ID_QUERY, {
                    id: profile?.sub,
                });

            if (!existingUser) {
                await writeClient.create({
                    _type: "author",
                    id: profile?.sub,
                    name: user.name,
                    username: profile?.name,
                    email: user.email,
                    image: user.image,
                    bio: profile?.name || null,
                });
            }

            return true;
        },
        async jwt({ token, account, profile }) {
            if (account && profile) {
                const user = await client
                    .withConfig({ useCdn: false })
                    .fetch(AUTHOR_BY_GOOGLE_ID_QUERY, {
                        id: profile?.sub,
                    });

                token.id = user?._id;
            }

            return token;
        },
        async session({ session, token }) {
            Object.assign(session, { id: token.id });
            return session;
        },
    },
    secret: process.env.AUTH_SECRET, // Додаємо секрет для розшифровки токенів
});