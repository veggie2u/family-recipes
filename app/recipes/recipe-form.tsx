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

interface RecipeFormValues {
  title: string;
  description: string;
  ingredients: string;
  instructions: string;
  is_public: boolean;
  tags: string[];
}

interface RecipeFormProps {
  defaultValues?: Partial<RecipeFormValues>;
  allTags?: string[];
  action: (formData: FormData) => Promise<void>;
  submitLabel?: string;
  cancelHref: string;
}

export function RecipeForm({
  defaultValues,
  allTags = [],
  action,
  submitLabel = "Save Recipe",
  cancelHref,
}: RecipeFormProps) {
  const form = useForm<RecipeFormValues>({
    defaultValues: {
      title: "",
      description: "",
      ingredients: "",
      instructions: "",
      is_public: false,
      tags: [],
      ...defaultValues,
    },
  });

  const onSubmit = async (values: RecipeFormValues) => {
    const formData = new FormData();
    formData.set("title", values.title);
    formData.set("description", values.description);
    formData.set("ingredients", values.ingredients);
    formData.set("instructions", values.instructions);
    if (values.is_public) formData.set("is_public", "on");
    formData.set("tags", JSON.stringify(values.tags));
    await action(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <FormField
          control={form.control}
          name="title"
          rules={{ required: "Title is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="e.g. Grandma's Apple Pie" {...field} />
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
                  placeholder="A short description of the recipe..."
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
          name="ingredients"
          rules={{ required: "Ingredients are required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ingredients <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Textarea
                  placeholder={"2 cups flour\n1 cup sugar\n..."}
                  rows={6}
                  className="font-mono"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="instructions"
          rules={{ required: "Instructions are required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instructions <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Textarea
                  placeholder={"Step 1: Preheat oven to 350°F\nStep 2: ..."}
                  rows={8}
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
                  Make this recipe public
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
