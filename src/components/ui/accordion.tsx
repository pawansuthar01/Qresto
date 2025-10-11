// components/ui/accordion.tsx
"use client";

import * as React from "react";

interface AccordionProps {
  type?: "single" | "multiple";
  children: React.ReactNode;
  className?: string;
  defaultValue?: string | string[];
}

interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
}

// Simple context to manage open state
const AccordionContext = React.createContext<any>(null);

export function Accordion({
  type = "single",
  children,
  className,
}: AccordionProps) {
  const [openItems, setOpenItems] = React.useState<string[]>([]);

  const toggleItem = (value: string) => {
    if (type === "single") {
      setOpenItems(openItems[0] === value ? [] : [value]);
    } else {
      setOpenItems(
        openItems.includes(value)
          ? openItems.filter((v) => v !== value)
          : [...openItems, value]
      );
    }
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className={`flex flex-col gap-2 ${className || ""}`}>{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({
  value,
  children,
  className,
}: AccordionItemProps) {
  return (
    <div className={`border rounded-md overflow-hidden ${className || ""}`}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, { itemValue: value });
      })}
    </div>
  );
}

export function AccordionTrigger({
  children,
  className,
  itemValue,
}: AccordionTriggerProps & { itemValue?: string }) {
  const { openItems, toggleItem } = React.useContext(AccordionContext);
  const isOpen = openItems.includes(itemValue || "");

  return (
    <button
      type="button"
      onClick={() => toggleItem(itemValue!)}
      className={`w-full flex justify-between items-center px-4 py-2 font-medium bg-gray-100 hover:bg-gray-200 ${
        className || ""
      }`}
    >
      {children}
      <span
        className={`transform transition-transform ${
          isOpen ? "rotate-180" : "rotate-0"
        }`}
      >
        &#9660;
      </span>
    </button>
  );
}

export function AccordionContent({
  children,
  className,
  itemValue,
}: AccordionContentProps & { itemValue?: string }) {
  const { openItems } = React.useContext(AccordionContext);
  const isOpen = openItems.includes(itemValue || "");

  return (
    <div
      className={`overflow-hidden transition-all duration-300 ${
        isOpen ? "max-h-96 p-4" : "max-h-0"
      } ${className || ""}`}
    >
      {children}
    </div>
  );
}
