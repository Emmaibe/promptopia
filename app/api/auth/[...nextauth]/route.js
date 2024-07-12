import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import User from "@models/user";
import { connectToDatabase } from "@util/mongodb";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        })
    ],
    async session(session) {
        const sessionUser = await User.findOne({ email: session.user.email });

        session.user.id = sessionUser._id.toString();

        return session;
    },
    async signIn(profile) {
        try {
            await connectToDatabase();

            // Check if user exists in the database
            const userExists = await User.findOne({ email: profile.email });

            // if not, create a new user
            if (!userExists) {
                await User.create({
                    email: profile.email,
                    username: profile.name.replace(" ", "").toLowerCase(),
                    image: profile.picture
                });
            }

            // return true
            return true;
        } catch (error) {
            console.error('Error signing in:', error);
        }
    }
})

export { handler as GET, handler as POST };