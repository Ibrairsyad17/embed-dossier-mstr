"use client"

import { useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, useInView } from "framer-motion"
import { ChevronRight, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import CodeDemo from "@/components/utils/code-demo"

export default function Home() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  // const { scrollYProgress } = useScroll()
  // const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.2])
  const router = useRouter()
  return (
    <main className="flex-1">
      {/* Code Demo Section */}
      <section id="demo" className="py-20">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <motion.div
              ref={ref}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col justify-center space-y-4"
            >
              <div className="space-y-2">
                <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                  <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
                  Production Ready
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                  Embed MicroStrategy <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                    in React beautifully.
                  </span>
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed pt-2">
                  A fully type-safe, production-ready React wrapper for the MicroStrategy Embedding SDK. Zero configuration, auto-cleanup, and 5 built-in auth methods.
                </p>
              </div>
              <div className="flex flex-col gap-3 min-[400px]:flex-row pt-4">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      "npm install embed-dossier-mstr-react"
                    )
                  }}
                  size="lg"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  <span>npm install embed-dossier-mstr-react</span>
                </Button>
                <Link href="/docs/introduction/installation">
                  <Button size="lg" variant="outline">
                    View Documentation
                  </Button>
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <CodeDemo />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center space-y-4 text-center"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Ready to Get Started?
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                Make your embedding experience seamless and efficient with
                EmbedYourDossier.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button
                size="lg"
                className="h-12 px-8 shadow-md hover:scale-105 transition-all"
                onClick={() => router.push("/docs/introduction/installation")}
              >
                Get Started
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8"
                onClick={() => window.open("https://github.com/Ibrairsyad17/embed-dossier-mstr", "_blank")}
              >
                GitHub
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
