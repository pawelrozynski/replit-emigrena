import { useQuery } from "@tanstack/react-query";
import type { CmsContent } from "@db/schema";

interface CmsContents {
  [key: string]: string;
}

export function useCms() {
  const { data: contents = [] } = useQuery<CmsContent[]>({
    queryKey: ['/api/cms'],
  });

  // Convert array of CMS contents to a key-value object for easier access
  const cmsContent = contents.reduce<CmsContents>((acc, content) => {
    acc[content.key] = content.content;
    return acc;
  }, {});

  return {
    getContent: (key: string) => cmsContent[key] || key,
    isLoading: !contents.length,
  };
}
