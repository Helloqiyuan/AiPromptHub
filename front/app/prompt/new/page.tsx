import { CreatePromptForm } from "@/components/prompt/create-prompt-form";
import { fetchCategories, fetchTags } from "@/lib/api";

/**
 * 新建 Prompt：服务端预取分类与标签，表单在客户端提交需 Bearer
 */
export default async function NewPromptPage() {
  const [categories, tags] = await Promise.all([
    fetchCategories(),
    fetchTags(),
  ]);

  return <CreatePromptForm categories={categories} tags={tags} />;
}
