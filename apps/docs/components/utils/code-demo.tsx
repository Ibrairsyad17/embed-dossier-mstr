"use client"

import { motion } from "framer-motion"

export default function CodeDemo() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden"
    >
      <div className="flex items-center border-b bg-muted/50 px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <div className="h-3 w-3 rounded-full bg-green-500" />
        </div>
        <div className="ml-4 text-xs font-medium">App.tsx</div>
      </div>
      <div className="p-6 text-sm font-mono">
        <pre className="text-xs md:text-sm leading-relaxed overflow-x-auto">
          <code className="space-y-2">
            <div className="flex gap-2">
              <span className="text-blue-500">import</span>
              <span className="text-foreground">React</span>
              <span className="text-blue-500">from</span>
              <span className="text-green-500">&apos;react&apos;</span>
              <span className="text-foreground">;</span>
            </div>

            <div className="flex gap-2">
              <span className="text-blue-500">import</span>
              <span className="text-foreground">{"{ DashboardEmbed }"}</span>
              <span className="text-blue-500">from</span>
              <span className="text-green-500">
                &apos;embed-dossier-mstr-react&apos;
              </span>
              <span className="text-foreground">;</span>
            </div>

            <div className="flex gap-2 pt-4">
              <span className="text-blue-500">function</span>
              <span className="text-yellow-500">App</span>
              <span className="text-foreground">() {"{"}</span>
            </div>

            <div className="ml-4">
              <span className="text-blue-500">const</span>
              <span className="text-foreground"> dossierUrl = </span>
              <span className="text-green-500">
                &quot;https://demo.microstrategy.com/library/app/EC70648611E7A2F962E90080EFD58751/A28CFE9411EB927C24A30080EF25D538&quot;
              </span>
              <span className="text-foreground">;</span>
            </div>

            <div className="ml-4 pt-2">
              <span className="text-blue-500">return</span>
              <span className="text-foreground"> (</span>
            </div>

            <div className="ml-8">
              <span className="text-purple-500">{"<div>"}</span>
            </div>

            <div className="ml-12">
              <span className="text-purple-500">{"<h1>"}</span>
              <span className="text-foreground">
                My MicroStrategy Dashboard
              </span>
              <span className="text-purple-500">{"</h1>"}</span>
            </div>

            <div className="ml-12">
              <span className="text-purple-500">{"<DashboardEmbed"}</span>
            </div>

            <div className="ml-16">
              <span className="text-blue-300">dossierUrl</span>
              <span className="text-foreground">=</span>
              <span className="text-foreground">
                {"{"}dossierUrl{"}"}
              </span>
            </div>

            <div className="ml-16">
              <span className="text-blue-300">className</span>
              <span className="text-foreground">=</span>
              <span className="text-green-500">
                &quot;w-full h-[600px]&quot;
              </span>
            </div>

            <div className="ml-16">
              <span className="text-blue-300">config</span>
              <span className="text-foreground">={"{"}</span>
            </div>

            <div className="ml-20">
              <span className="text-yellow-500">
                enableCustomAuthentication
              </span>
              <span className="text-foreground">: </span>
              <span className="text-blue-500">true</span>
              <span className="text-foreground">,</span>
            </div>

            <div className="ml-20">
              <span className="text-yellow-500">enableResponsive</span>
              <span className="text-foreground">: </span>
              <span className="text-blue-500">true</span>
            </div>

            <div className="ml-16">
              <span className="text-foreground">{"}"}</span>
            </div>

            <div className="ml-12">
              <span className="text-purple-500">{"/>"}</span>
            </div>

            <div className="ml-8">
              <span className="text-purple-500">{"</div>"}</span>
            </div>

            <div className="ml-4">
              <span className="text-foreground">{");"}</span>
            </div>

            <div>
              <span className="text-foreground">{"}"}</span>
            </div>

            <div className="pt-4">
              <span className="text-blue-500">export</span>
              <span className="text-foreground"> </span>
              <span className="text-blue-500">default</span>
              <span className="text-foreground"> App;</span>
            </div>
          </code>
        </pre>
      </div>
    </motion.div>
  )
}
