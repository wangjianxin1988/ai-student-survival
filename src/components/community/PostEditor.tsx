import React, { useState } from "react";
import { type CommunityCategory, CATEGORY_LABELS } from "@/lib/community/types";
import MathCaptcha from "@/components/common/MathCaptcha";

interface PostEditorProps {
  initialData?: {
    title?: string;
    content?: string;
    category?: CommunityCategory;
    tags?: string[];
    meta?: Record<string, unknown>;
  };
  onSubmit: (data: {
    title: string;
    content: string;
    category: string;
    tags: string[];
    meta?: Record<string, unknown>;
  }) => Promise<void>;
  onCancel?: () => void;
}

const CATEGORIES: {
  value: CommunityCategory;
  label: string;
  description: string;
}[] = [
  {
    value: "tools",
    label: "AI工具",
    description: "分享AI工具的使用体验、评测",
  },
  {
    value: "payment",
    label: "支付指南",
    description: "介绍支付方式、换汇技巧",
  },
  { value: "policy", label: "大学政策", description: "分享大学AI使用政策" },
  { value: "prompt", label: "Prompt", description: "分享有用的Prompt模板" },
  {
    value: "survival",
    label: "妙妙贴",
    description: "分享留学生活技巧、防坑指南",
  },
  { value: "discussion", label: "讨论", description: "自由讨论话题" },
  { value: "qa", label: "问答", description: "提问和解答" },
];

// AI工具表单字段
function ToolsForm({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (field: string, value: unknown) => void;
}) {
  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    onChange("name", name);
    // Auto-generate slug if not manually set
    if (!data.slug || (data.name && data.name !== name)) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      onChange("slug", slug);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          工具名称 *
        </label>
        <input
          type="text"
          value={(data.name as string) || ""}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="例如: ChatGPT, Midjourney"
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL Slug
        </label>
        <input
          type="text"
          value={(data.slug as string) || ""}
          onChange={(e) => onChange("slug", e.target.value)}
          placeholder="auto-generated-from-name"
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            定价模式 *
          </label>
          <select
            value={(data.pricing as string) || "free"}
            onChange={(e) => onChange("pricing", e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="free">免费 (Free)</option>
            <option value="freemium">免费+付费 (Freemium)</option>
            <option value="paid">付费 (Paid)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            子分类
          </label>
          <input
            type="text"
            value={(data.subcategory as string) || ""}
            onChange={(e) => onChange("subcategory", e.target.value)}
            placeholder="例如: 写作、编程、设计"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {(data.pricing === "paid" || data.pricing === "freemium") && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              月付价格
            </label>
            <input
              type="number"
              value={(data.priceMonthly as number) || ""}
              onChange={(e) =>
                onChange("priceMonthly", parseFloat(e.target.value))
              }
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              年付价格
            </label>
            <input
              type="number"
              value={(data.priceYearly as number) || ""}
              onChange={(e) =>
                onChange("priceYearly", parseFloat(e.target.value))
              }
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          官网URL *
        </label>
        <input
          type="url"
          value={(data.url as string) || ""}
          onChange={(e) => onChange("url", e.target.value)}
          placeholder="https://..."
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          工具描述 *
        </label>
        <textarea
          value={(data.description as string) || ""}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="详细描述这个工具的功能和特点..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          主要功能（每行一个）
        </label>
        <textarea
          value={((data.features as string[]) || []).join("\n")}
          onChange={(e) =>
            onChange(
              "features",
              e.target.value.split("\n").filter((f) => f.trim()),
            )
          }
          placeholder="功能1&#10;功能2&#10;功能3"
          rows={4}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          同类替代工具（每行一个）
        </label>
        <textarea
          value={((data.alternatives as string[]) || []).join("\n")}
          onChange={(e) =>
            onChange(
              "alternatives",
              e.target.value.split("\n").filter((a) => a.trim()),
            )
          }
          placeholder="替代工具1&#10;替代工具2"
          rows={3}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          使用技巧（每行一条）
        </label>
        <textarea
          value={((data.tips as string[]) || []).join("\n")}
          onChange={(e) =>
            onChange(
              "tips",
              e.target.value.split("\n").filter((t) => t.trim()),
            )
          }
          placeholder="技巧1&#10;技巧2&#10;技巧3"
          rows={4}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          使用教程（每行一个步骤，格式：标题|描述）
        </label>
        <textarea
          value={(
            (data.howToUse as Array<{
              step: number;
              title: string;
              description: string;
            }>) || []
          )
            .map((h, i) => `${i + 1}. ${h.title}|${h.description}`)
            .join("\n")}
          onChange={(e) => {
            const lines = e.target.value.split("\n").filter((l) => l.trim());
            const howToUse = lines.map((line, i) => {
              const [title, ...descParts] = line.split("|");
              return {
                step: i + 1,
                title: title.replace(/^\d+\.\s*/, "").trim(),
                description: descParts.join("|").trim(),
              };
            });
            onChange("howToUse", howToUse);
          }}
          placeholder="1. 注册账号|访问官网并注册&#10;2. 创建API|在控制台创建API密钥"
          rows={4}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          使用场景（每行一个，格式：标题|描述）
        </label>
        <textarea
          value={(
            (data.useCases as Array<{ title: string; description: string }>) ||
            []
          )
            .map((u) => `${u.title}|${u.description}`)
            .join("\n")}
          onChange={(e) => {
            const lines = e.target.value.split("\n").filter((l) => l.trim());
            const useCases = lines.map((line) => {
              const [title, ...descParts] = line.split("|");
              return {
                title: title.trim(),
                description: descParts.join("|").trim(),
              };
            });
            onChange("useCases", useCases);
          }}
          placeholder="写作辅助|帮助撰写文章、邮件等&#10;代码生成|辅助编写代码片段"
          rows={4}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
    </div>
  );
}

// 支付指南表单字段
function PaymentForm({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (field: string, value: unknown) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          支付类型 *
        </label>
        <select
          value={(data.paymentCategory as string) || "virtual_card"}
          onChange={(e) => onChange("paymentCategory", e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="virtual_card">虚拟卡</option>
          <option value="gift_card">礼品卡</option>
          <option value="regional_pricing">地区定价</option>
          <option value="troubleshooting">支付问题解决</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            难度
          </label>
          <select
            value={(data.difficulty as string) || "easy"}
            onChange={(e) => onChange("difficulty", e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="easy">简单</option>
            <option value="medium">中等</option>
            <option value="hard">困难</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            可靠性
          </label>
          <select
            value={(data.reliability as string) || "high"}
            onChange={(e) => onChange("reliability", e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          适用的AI工具（每行一个）
        </label>
        <textarea
          value={((data.toolIds as string[]) || []).join("\n")}
          onChange={(e) =>
            onChange(
              "toolIds",
              e.target.value.split("\n").filter((t) => t.trim()),
            )
          }
          placeholder="ChatGPT&#10;Claude&#10;Midjourney"
          rows={3}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          详细教程 *
        </label>
        <textarea
          value={(data.content as string) || ""}
          onChange={(e) => onChange("content", e.target.value)}
          placeholder="详细描述支付步骤和注意事项..."
          rows={8}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
    </div>
  );
}

// 大学政策表单字段
function PolicyForm({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (field: string, value: unknown) => void;
}) {
  // Auto-generate universitySlug from universityName
  const handleUniversityNameChange = (name: string) => {
    onChange("universityName", name);
    if (
      !data.universitySlug ||
      (data.universityName && data.universityName !== name)
    ) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      onChange("universitySlug", slug);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            大学名称 *
          </label>
          <input
            type="text"
            value={(data.universityName as string) || ""}
            onChange={(e) => handleUniversityNameChange(e.target.value)}
            placeholder="例如: 麻省理工学院"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL Slug
          </label>
          <input
            type="text"
            value={(data.universitySlug as string) || ""}
            onChange={(e) => onChange("universitySlug", e.target.value)}
            placeholder="auto-generated-from-name"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          国家
        </label>
        <input
          type="text"
          value={(data.country as string) || ""}
          onChange={(e) => onChange("country", e.target.value)}
          placeholder="例如: 美国"
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          总体政策 *
        </label>
        <select
          value={(data.overallPolicy as string) || "case_by_case"}
          onChange={(e) => onChange("overallPolicy", e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="allowed">允许</option>
          <option value="restricted">限制</option>
          <option value="prohibited">禁止</option>
          <option value="case_by_case">课程决定</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          教学场景政策 *
        </label>
        <textarea
          value={(data.teachingPolicy as string) || ""}
          onChange={(e) => onChange("teachingPolicy", e.target.value)}
          placeholder="描述在教学场景中的AI使用政策..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          作业政策 *
        </label>
        <textarea
          value={(data.assignmentPolicy as string) || ""}
          onChange={(e) => onChange("assignmentPolicy", e.target.value)}
          placeholder="描述作业中的AI使用规定..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          考试政策 *
        </label>
        <textarea
          value={(data.examPolicy as string) || ""}
          onChange={(e) => onChange("examPolicy", e.target.value)}
          placeholder="描述考试中的AI使用规定..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          允许使用的AI工具（逗号分隔）
        </label>
        <input
          type="text"
          value={((data.allowedTools as string[]) || []).join(", ")}
          onChange={(e) =>
            onChange(
              "allowedTools",
              e.target.value
                .split(",")
                .map((t) => t.trim())
                .filter((t) => t),
            )
          }
          placeholder="ChatGPT, Claude, GitHub Copilot"
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          限制使用的AI工具（逗号分隔）
        </label>
        <input
          type="text"
          value={((data.restrictedTools as string[]) || []).join(", ")}
          onChange={(e) =>
            onChange(
              "restrictedTools",
              e.target.value
                .split(",")
                .map((t) => t.trim())
                .filter((t) => t),
            )
          }
          placeholder="DALL-E, Jasper"
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          禁止使用的AI工具（逗号分隔）
        </label>
        <input
          type="text"
          value={((data.prohibitedTools as string[]) || []).join(", ")}
          onChange={(e) =>
            onChange(
              "prohibitedTools",
              e.target.value
                .split(",")
                .map((t) => t.trim())
                .filter((t) => t),
            )
          }
          placeholder="明确的禁止工具"
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          小组项目政策
        </label>
        <textarea
          value={(data.groupProjectPolicy as string) || ""}
          onChange={(e) => onChange("groupProjectPolicy", e.target.value)}
          placeholder="描述在小组项目、团队作业等场景中的AI使用规定..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          编程场景政策
        </label>
        <textarea
          value={(data.codingPolicy as string) || ""}
          onChange={(e) => onChange("codingPolicy", e.target.value)}
          placeholder="描述在编程、代码编写等场景中的AI使用规定..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
    </div>
  );
}

// Prompt表单字段
function PromptForm({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (field: string, value: unknown) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Prompt分类 *
        </label>
        <select
          value={(data.promptCategory as string) || "daily"}
          onChange={(e) => onChange("promptCategory", e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="application">申请文书</option>
          <option value="thesis">论文写作</option>
          <option value="job">求职简历</option>
          <option value="daily">日常使用</option>
          <option value="research">学术研究</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          适用工具
        </label>
        <select
          value={(data.toolId as string) || ""}
          onChange={(e) => onChange("toolId", e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">通用</option>
          <option value="chatgpt">ChatGPT</option>
          <option value="claude">Claude</option>
          <option value="gemini">Gemini</option>
          <option value="kimi">Kimi</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Prompt内容 *
        </label>
        <textarea
          value={(data.content as string) || ""}
          onChange={(e) => onChange("content", e.target.value)}
          placeholder="粘贴你的Prompt模板..."
          rows={10}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          使用说明
        </label>
        <textarea
          value={(data.howToUse as string) || ""}
          onChange={(e) => onChange("howToUse", e.target.value)}
          placeholder="描述如何使用这个Prompt，有什么注意事项..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
    </div>
  );
}

// 妙妙贴表单字段
function SurvivalForm({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (field: string, value: unknown) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          分类 *
        </label>
        <select
          value={(data.survivalCategory as string) || "other"}
          onChange={(e) => onChange("survivalCategory", e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="scam">防骗指南</option>
          <option value="culture">文化禁忌</option>
          <option value="safety">安全提醒</option>
          <option value="legal">法律须知</option>
          <option value="other">其他</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            国家
          </label>
          <input
            type="text"
            value={(data.country as string) || ""}
            onChange={(e) => onChange("country", e.target.value)}
            placeholder="例如: 美国"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            大学
          </label>
          <input
            type="text"
            value={(data.universityId as string) || ""}
            onChange={(e) => onChange("universityId", e.target.value)}
            placeholder="大学名称"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          内容（英文）*
        </label>
        <textarea
          value={(data.content as string) || ""}
          onChange={(e) => onChange("content", e.target.value)}
          placeholder="英文内容..."
          rows={8}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          内容（中文）
        </label>
        <textarea
          value={(data.contentZh as string) || ""}
          onChange={(e) => onChange("contentZh", e.target.value)}
          placeholder="中文内容（可选）..."
          rows={8}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
    </div>
  );
}

// 讨论/问答表单字段
function DiscussionForm({
  data,
  onChange,
  isQA,
}: {
  data: Record<string, unknown>;
  onChange: (field: string, value: unknown) => void;
  isQA: boolean;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {isQA ? "问题描述 *" : "话题内容 *"}
        </label>
        <textarea
          value={(data.content as string) || ""}
          onChange={(e) => onChange("content", e.target.value)}
          placeholder={isQA ? "详细描述你的问题..." : "详细描述你的话题..."}
          rows={10}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
    </div>
  );
}

export function PostEditor({
  initialData,
  onSubmit,
  onCancel,
}: PostEditorProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [category, setCategory] = useState<CommunityCategory>(
    initialData?.category || "discussion",
  );
  const [tagsInput, setTagsInput] = useState(
    initialData?.tags?.join(", ") || "",
  );
  const [meta, setMeta] = useState<Record<string, unknown>>(
    initialData?.meta || {},
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [honeypot, setHoneypot] = useState(""); // Honeypot field
  const [captchaVerified, setCaptchaVerified] = useState(false); // Math captcha

  const handleMetaChange = (field: string, value: unknown) => {
    setMeta((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string | null => {
    if (!title.trim()) return "请输入标题";
    if (!category) return "请选择分类";

    // Validate category-specific fields
    switch (category) {
      case "tools":
        if (!meta.name) return "请输入工具名称";
        if (!meta.slug) return "请输入工具slug";
        if (!meta.description) return "请输入工具描述";
        if (!meta.url) return "请输入官网URL";
        break;
      case "payment":
        if (!meta.paymentCategory) return "请选择支付类型";
        if (!meta.difficulty) return "请选择难度等级";
        if (!meta.reliability) return "请选择可靠程度";
        if (!Array.isArray(meta.toolIds) || meta.toolIds.length === 0)
          return "请选择关联工具";
        if (!meta.content) return "请输入详细教程";
        break;
      case "policy":
        if (!meta.universityName) return "请输入大学名称";
        if (!meta.universitySlug) return "请输入大学slug";
        if (!meta.country) return "请选择国家";
        if (!meta.overallPolicy) return "请选择AI使用总政策";
        if (!meta.teachingPolicy) return "请输入教学场景政策";
        if (!meta.assignmentPolicy) return "请输入作业政策";
        if (!meta.examPolicy) return "请输入考试政策";
        if (!meta.codingPolicy) return "请输入编程相关政策";
        if (!meta.groupProjectPolicy) return "请输入小组项目政策";
        break;
      case "prompt":
        if (!meta.promptCategory) return "请选择Prompt分类";
        if (!meta.content) return "请输入Prompt内容";
        break;
      case "survival":
        if (!meta.survivalCategory) return "请选择妙妙贴分类";
        if (!meta.content) return "请输入内容";
        break;
      default:
        if (!content.trim()) return "请输入内容";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Honeypot check - if filled, it's a bot
    if (honeypot) {
      // Silently show success to fool bots
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLoading(false);
      onSubmit?.({
        title: title.trim(),
        content: content.trim(),
        category,
        tags: [],
        meta,
      });
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    // Build content from meta for structured categories
    let finalContent = content;
    let finalMeta = meta;

    // If meta has content field and it's a structured category, use that
    if (
      meta.content &&
      ["payment", "policy", "prompt", "survival"].includes(category)
    ) {
      finalContent = meta.content as string;
      // Remove content from meta to avoid duplication
      finalMeta = { ...meta };
      delete finalMeta.content;
    }

    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        content: finalContent,
        category,
        tags,
        meta: Object.keys(finalMeta).length > 0 ? finalMeta : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {initialData ? "编辑帖子" : "发布帖子"}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择分类 *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => {
                  setCategory(cat.value);
                  setMeta({});
                }}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  category === cat.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-medium text-gray-900 text-sm">
                  {cat.label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                  {cat.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            标题 *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="输入帖子标题"
            maxLength={255}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="text-right text-xs text-gray-400 mt-1">
            {title.length}/255
          </div>
        </div>

        {/* Category-specific form fields */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {category === "tools" && "AI工具信息"}
            {category === "payment" && "支付指南信息"}
            {category === "policy" && "政策信息"}
            {category === "prompt" && "Prompt信息"}
            {category === "survival" && "妙妙贴信息"}
            {(category === "discussion" || category === "qa") &&
              (category === "qa" ? "问题详情" : "话题详情")}
          </label>
          {category === "tools" && (
            <ToolsForm data={meta} onChange={handleMetaChange} />
          )}
          {category === "payment" && (
            <PaymentForm data={meta} onChange={handleMetaChange} />
          )}
          {category === "policy" && (
            <PolicyForm data={meta} onChange={handleMetaChange} />
          )}
          {category === "prompt" && (
            <PromptForm data={meta} onChange={handleMetaChange} />
          )}
          {category === "survival" && (
            <SurvivalForm data={meta} onChange={handleMetaChange} />
          )}
          {(category === "discussion" || category === "qa") && (
            <DiscussionForm
              data={meta}
              onChange={handleMetaChange}
              isQA={category === "qa"}
            />
          )}
        </div>

        {/* Only show extra content field for simple posts */}
        {category === "discussion" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              补充内容
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="补充说明（可选）..."
              rows={6}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            标签（用逗号分隔）
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="例如: AI, 工具, 推荐"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="text-xs text-gray-400 mt-1">多个标签用逗号分隔</div>
        </div>

        {/* Honeypot field - hidden from real users */}
        <div className="absolute -left-[9999px]" aria-hidden="true">
          <input
            type="text"
            name="post_url"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Promotion hints - show only for categories with target boards */}
        {category !== "discussion" && category !== "qa" && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-sm">
                <p className="text-blue-800 font-medium mb-1">
                  {CATEGORY_LABELS[category]?.zh || "该分类"}帖子推送说明
                </p>
                <ul className="text-blue-600 space-y-1">
                  <li>
                    • 热度达标后自动推送到{" "}
                    {CATEGORY_LABELS[category]?.zh || "该分类"} 板块
                  </li>
                  <li>• 或消耗 50 积分直接发布到目标板块</li>
                  <li>• 消耗 20 积分可获得 24 小时热门加速</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Math Captcha for spam protection */}
        <div className="mb-4">
          <MathCaptcha onVerify={(verified) => setCaptchaVerified(verified)} />
        </div>

        <div className="flex items-center justify-end gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !captchaVerified}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "发布中..." : "发布帖子"}
          </button>
        </div>
      </div>
    </form>
  );
}