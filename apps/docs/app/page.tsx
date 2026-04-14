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
              <div className="space-y-4">
                <p className="text-sm font-semibold tracking-widest text-primary uppercase">
                  Open Source • React • MicroStrategy
                </p>
                <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl md:text-7xl text-foreground">
                  MicroStrategy Embedding, <br />
                  <span className="italic font-light text-primary">Simplified.</span>
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl leading-relaxed pt-4">
                  A beautiful, type-safe wrapper for the MicroStrategy SDK. No global mutations. No messy scripts. Just clean, idiomatic React.
                </p>
              </div>
              <div className="flex flex-col gap-4 min-[400px]:flex-row pt-8">
                <Button
                  onClick={() => router.push("/docs/introduction/installation")}
                  size="lg"
                  className="rounded-full h-14 px-8 font-medium shadow-sm transition-transform hover:-translate-y-1"
                >
                  Read the Docs
                </Button>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText("npm install embed-dossier-mstr-react")
                  }}
                  size="lg"
                  variant="secondary"
                  className="rounded-full h-14 px-8 font-medium transition-transform hover:-translate-y-1"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  <span>npm install embed-dossier-mstr-react</span>
                </Button>
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
      <section className="py-32 bg-secondary/30">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center space-y-6 text-center"
          >
            <div className="space-y-4">
              <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl text-foreground">
                Start embedding today.
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl leading-relaxed mx-auto">
                Stop fighting with vanilla JavaScript configurations. Get your dashboard running in under 5 minutes.
              </p>
            </div>
            <div className="flex flex-col gap-4 min-[400px]:flex-row pt-4">
              <Button
                size="lg"
                className="rounded-full h-14 px-10 shadow-sm hover:-translate-y-1 transition-transform"
                onClick={() => router.push("/docs/introduction/installation")}
              >
                Get Started
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full h-14 px-10 hover:-translate-y-1 transition-transform bg-transparent"
                onClick={() => window.open("https://github.com/Ibrairsyad17/embed-dossier-mstr", "_blank")}
              >
                View on GitHub
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
