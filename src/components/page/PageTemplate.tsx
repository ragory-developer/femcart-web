import { notFound } from "next/navigation";

export default function PageTemplate({ page }: { page: any }) {
  if (!page) notFound();

  return (
    <main className="min-h-[100dvh] bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="bg-white dark:bg-gray-900 shadow-sm rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800">
          <div className="p-8 md:p-12 lg:p-16">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 pb-8 border-b border-gray-100 dark:border-gray-800">
              {page.title}
            </h1>

            <div
              className="prose prose-lg dark:prose-invert max-w-none 
                         mx-auto leading-relaxed
                         [&>p]:mb-6 [&>p]:text-gray-600 dark:[&>p]:text-gray-300
                         [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-6 [&>h1]:mt-10 dark:[&>h1]:text-white
                         [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mb-4 [&>h2]:mt-8 dark:[&>h2]:text-white
                         [&>h3]:text-xl [&>h3]:font-bold [&>h3]:mb-4 [&>h3]:mt-6 dark:[&>h3]:text-white
                         [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 dark:[&>ul]:text-gray-300
                         [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-6 dark:[&>ol]:text-gray-300
                         [&>a]:text-blue-600 dark:[&>a]:text-blue-400 [&>a]:underline
                         [&>blockquote]:border-l-4 [&>blockquote]:border-gray-200 dark:[&>blockquote]:border-gray-700 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-gray-500 dark:[&>blockquote]:text-gray-400"
              dangerouslySetInnerHTML={{ __html: page.content || "" }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
