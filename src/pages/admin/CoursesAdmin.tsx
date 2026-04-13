import { useState } from "react";
import SEO from "@/components/SEO";
import { courses } from "@/data/educationArticles";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Edit, DollarSign } from "lucide-react";

const CoursesAdmin = () => {
  return (
    <div className="space-y-6">
      <SEO title="Courses Admin" description="Manage courses and ebooks" path="/admin/courses" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Courses & Ebooks</h1>
          <p className="text-sm text-muted-foreground">{courses.length} products</p>
        </div>
        <Button size="sm" disabled>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Course
        </Button>
      </div>

      <div className="space-y-2">
        {courses.map((course) => (
          <Card key={course.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DollarSign className="w-4 h-4 text-accent" />
                <div>
                  <h3 className="font-medium text-sm text-foreground">{course.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono uppercase text-accent">{course.type}</span>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className="text-[10px] font-bold text-foreground">${course.price}</span>
                    {course.originalPrice && (
                      <>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <span className="text-[10px] text-muted-foreground line-through">${course.originalPrice}</span>
                      </>
                    )}
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className={`text-[10px] font-mono ${course.isActive ? "text-primary" : "text-muted-foreground"}`}>
                      {course.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" disabled>
                <Edit className="w-3.5 h-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground italic">
        Full CRUD editing will be available once the courses database table is created.
      </p>
    </div>
  );
};

export default CoursesAdmin;
