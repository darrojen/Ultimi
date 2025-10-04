// "use client"

// import { motion } from "framer-motion"
// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent } from "@/components/ui/card"
// import ModeToggle from "@/app/theme/page"
// import Box from "@/components/ui/box"
// import { Bot, Earth, NotebookText } from "lucide-react"

// export default function HomePage() {
//   return (
//     <Box className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-6">
//       {/* Hero Section */}
//       <ModeToggle />
//       <motion.div
//         initial={{ opacity: 0, y: 40 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8 }}
//         className="max-w-3xl text-center"
//       >
//         <Box as="h1" className="text-5xl font-extrabold tracking-tight mb-4">
//           Welcome to <Box  as="span" className="text-primary">Ultimi</Box>
//         </Box>
//         <Box as="p" className="text-lg text-muted-foreground mb-6">
//           Generate, practice, and challenge yourself with AI-powered quizzes.
//           Learn smarter, faster, and better.
//         </Box>

//         <Box  as="div" className="flex gap-4 justify-center">
//           <Link href="/register">
//             <Button size="lg" className="rounded-2xl cursor-pointer shadow-lg">
//               Get Started
//             </Button>
//           </Link>
//           <Link href="/login">
//             <Button size="lg" variant="outline" className="cursor-pointer rounded-2xl">
//               Sign In
//             </Button>
//           </Link>
//         </Box>
//       </motion.div>

//       {/* Features Section */}
//       <motion.div
//         initial={{ opacity: 0, y: 40 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.5, duration: 0.8 }}
//         className="grid md:grid-cols-3 gap-6 mt-20 w-full max-w-5xl"
//       >
//         <Card className="rounded-2xl shadow-md hover:shadow-lg transition">
//           <CardContent className="p-6 text-center">
//             <Box as="h3" className="text-xl font-semibold mb-2"><NotebookText className="relative"/> AI Quiz Generator</Box>
//             <Box as="p" className="text-sm text-muted-foreground">
//               Upload notes or enter topics and instantly generate quizzes tailored to your needs.
//             </Box>
//           </CardContent>
//         </Card>

//         <Card className="rounded-2xl shadow-md hover:shadow-lg transition">
//           <CardContent className="p-6 text-center">
//             <Box as="h3" className="text-xl font-semibold mb-2"><Bot /> Smart Practice</Box>
//             <Box className="text-sm text-muted-foreground">
//               Adaptive question difficulty that grows with you as you improve.
//             </Box>
//           </CardContent>
//         </Card>

//         <Card className="rounded-2xl shadow-md hover:shadow-lg transition">
//           <CardContent className="p-6 text-center">
//             <Box as="h3" className="text-xl font-semibold mb-2"><Earth /> Study Anywhere</Box>
//             <Box as="p" className="text-sm text-muted-foreground">
//               Responsive design so you can learn seamlessly on mobile, tablet, or desktop.
//             </Box>
//           </CardContent>
//         </Card>
//       </motion.div>

//       {/* Footer */}
//       <motion.footer
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 1, duration: 1 }}
//         className="mt-20 text-sm text-muted-foreground"
//       >
//         © {new Date().getFullYear()} Ultimi. All rights reserved.
//       </motion.footer>
//     </Box>
//   )
// }



// "use client"

// import { motion } from "framer-motion"
// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent } from "@/components/ui/card"
// import ModeToggle from "@/app/theme/page"
// import Box from "@/components/ui/box"
// import { Bot, Earth, NotebookText } from "lucide-react"

// export default function HomePage() {
//   return (
//     <Box className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-6">
//       {/* Hero Section */}
//       <ModeToggle />
//       <motion.div
//         initial={{ opacity: 0, y: 40 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8 }}
//         className="max-w-3xl text-center"
//       >
//         <Box as="h1" className="text-5xl font-extrabold tracking-tight mb-4">
//           Welcome to <Box as="span" className="text-primary">Ultimi</Box>
//         </Box>
//         <Box as="p" className="text-lg text-muted-foreground mb-6">
//           Generate, practice, and challenge yourself with AI-powered quizzes.
//           Learn smarter, faster, and better.
//         </Box>

//         <Box as="div" className="flex gap-4 justify-center">
//           <Link href="/register">
//             <Button size="lg" className="rounded-2xl cursor-pointer shadow-lg">
//               Get Started
//             </Button>
//           </Link>
//           <Link href="/login">
//             <Button size="lg" variant="outline" className="cursor-pointer rounded-2xl">
//               Sign In
//             </Button>
//           </Link>
//         </Box>
//       </motion.div>

//       {/* Features Section */}
//       <motion.div
//         initial={{ opacity: 0, y: 40 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.5, duration: 0.8 }}
//         className="grid md:grid-cols-3 gap-6 mt-20 w-full max-w-5xl"
//       >
//         <Card className="rounded-2xl shadow-md hover:shadow-lg transition">
//           <CardContent className="p-6 text-center">
//             <Box 
//               as="h3" 
//               className="text-xl  font-semibold mb-2 flex items-center justify-center gap-2"
//             >
//               <NotebookText className="w-5 h-5" />
//               AI Quiz Generator
//             </Box>
//             <Box as="p" className="text-sm text-muted-foreground">
//               Upload notes or enter topics and instantly generate quizzes tailored to your needs.
//             </Box>
//           </CardContent>
//         </Card>

//         <Card className="rounded-2xl shadow-md hover:shadow-lg transition">
//           <CardContent className="p-6 text-center">
//             <Box 
//               as="h3" 
//               className="text-xl font-semibold mb-2 flex items-center justify-center gap-2"
//             >
//               <Bot className="w-5 h-5" />
//               Smart Practice
//             </Box>
//             <Box className="text-sm text-muted-foreground">
//               Adaptive question difficulty that grows with you as you improve.
//             </Box>
//           </CardContent>
//         </Card>

//         <Card className="rounded-2xl shadow-md hover:shadow-lg transition">
//           <CardContent className="p-6 text-center">
//             <Box 
//               as="h3" 
//               className="text-xl font-semibold mb-2 flex items-center justify-center gap-2"
//             >
//               <Earth className="w-5 h-5" />
//               Study Anywhere
//             </Box>
//             <Box as="p" className="text-sm text-muted-foreground">
//               Responsive design so you can learn seamlessly on mobile, tablet, or desktop.
//             </Box>
//           </CardContent>
//         </Card>
//       </motion.div>

//       {/* Footer */}
//       <motion.footer
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 1, duration: 1 }}
//         className="mt-20 text-sm text-muted-foreground"
//       >
//         © {new Date().getFullYear()} Ultimi. All rights reserved.
//       </motion.footer>
//     </Box>
//   )
// }


"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import ModeToggle from "@/app/theme/page"
import Box from "@/components/ui/box"
import { Bot, Earth, NotebookText } from "lucide-react"

export default function HomePage() {
  return (
    <Box className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-6">
      {/* Hero Section */}
      <ModeToggle />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl text-center"
      >
        <Box as="h1" className="text-5xl font-extrabold tracking-tight mb-4">
          Welcome to <Box as="span" className="text-primary">Ultimi</Box>
        </Box>
        <Box as="p" className="text-lg text-muted-foreground mb-6">
          Generate, practice, and challenge yourself with AI-powered quizzes.
          Learn smarter, faster, and better.
        </Box>

        <Box as="div" className="flex gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="rounded-2xl cursor-pointer shadow-lg">
              Get Started
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="cursor-pointer rounded-2xl">
              Sign In
            </Button>
          </Link>
        </Box>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="grid md:grid-cols-3 gap-6 mt-20 w-full max-w-5xl"
      >
        <Card className="rounded-2xl shadow-md hover:shadow-lg transition">
          <CardContent className="p-6 text-center">
            <Box 
              as="h3" 
              className="text-xl font-semibold mb-2 flex items-center justify-center gap-2"
            >
              <NotebookText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              AI Quiz Generator
            </Box>
            <Box as="p" className="text-sm text-muted-foreground">
              Upload notes or enter topics and instantly generate quizzes tailored to your needs.
            </Box>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-md hover:shadow-lg transition">
          <CardContent className="p-6 text-center">
            <Box 
              as="h3" 
              className="text-xl font-semibold mb-2 flex items-center justify-center gap-2"
            >
              <Bot className="w-6 h-6 text-green-600 dark:text-green-400" />
              Smart Practice
            </Box>
            <Box className="text-sm text-muted-foreground">
              Adaptive question difficulty that grows with you as you improve.
            </Box>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-md hover:shadow-lg transition">
          <CardContent className="p-6 text-center">
            <Box 
              as="h3" 
              className="text-xl font-semibold mb-2 flex items-center justify-center gap-2"
            >
              <Earth className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              Study Anywhere
            </Box>
            <Box as="p" className="text-sm text-muted-foreground">
              Responsive design so you can learn seamlessly on mobile, tablet, or desktop.
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="mt-20 text-sm text-muted-foreground"
      >
        © {new Date().getFullYear()} Ultimi. All rights reserved.
      </motion.footer>
    </Box>
  )
}
