"use client";

import { useForm } from "react-hook-form";
import Link from "next/link";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { TagInput } from "@/components/tag-input";

interface CookbookFormValues {
  name: string;
  description: string;
  is_public: boolean;
  tags: string[];
}

interface CookbookFormProps {
  defaultValues?: Partial<CookbookFormValues>;
  allTags?: string[];
  action: (formData: FormData) => Promise<void>;
  submitLabel?: string;
  cancelHref: string;
}

export function CookbookForm({
  defaultValues,
  allTags = [],
  action,
  submitLabel = "Save Cookbook",
  cancelHref,
}: CookbookFormProps) {
  const form = useForm<CookbookFormValues>({
    defaultValues: {
      name: "",
      description: "",
      is_public: false,
      tags: [],
      ...defaultValues,
    },
  });

  const onSubmit = async (values: CookbookFormValues) => {
    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("description", values.description);
    if (values.is_public) formData.set("is_public", "on");
    formData.set("tags", JSON.stringify(values.tags));
    await action(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <FormField
          control={form.control}
          name="name"
          rules={{ required: "Name is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="e.g. Holiday Favorites" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A short description of this cookbook..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <TagInput
                  allTags={allTags}
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_public"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-medium cursor-pointer">
                  Make this cookbook public
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {submitLabel}
          </Button>
          <Button asChild variant="outline">
            <Link href={cancelHref}>Cancel</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
