import * as React from "react"

import { cn } from "@/lib/utils"

type TableVariant = "default" | "comfortable" | "report"

type TableWrap = "nowrap" | "wrap"

type TableContextValue = {
  variant: TableVariant
  striped: boolean
  stickyHeader: boolean
  wrap: TableWrap
}

const TableContext = React.createContext<TableContextValue | null>(null)

function useTableContext(): TableContextValue {
  const ctx = React.useContext(TableContext)
  return (
    ctx ?? {
      variant: "default",
      striped: false,
      stickyHeader: false,
      wrap: "nowrap",
    }
  )
}

type TableProps = React.ComponentProps<"table"> & {
  variant?: TableVariant
  striped?: boolean
  stickyHeader?: boolean
  wrap?: TableWrap
}

function Table({
  className,
  variant = "default",
  striped,
  stickyHeader = false,
  wrap,
  ...props
}: TableProps) {
  const resolvedStriped = striped ?? variant !== "default"
  const resolvedWrap = wrap ?? "nowrap"

  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto rounded-md border border-border/60 bg-background"
    >
      <TableContext.Provider value={{ variant, striped: resolvedStriped, stickyHeader, wrap: resolvedWrap }}>
        <table
          data-slot="table"
          className={cn(
            "w-full caption-bottom",
            variant === "comfortable" ? "text-[15px]" : "text-sm",
            resolvedStriped && "[&_tbody_tr:nth-child(even)]:bg-muted/20",
            className,
          )}
          {...props}
        />
      </TableContext.Provider>
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  const { variant } = useTableContext()

  return (
    <thead
      data-slot="table-header"
      className={cn(
        variant !== "default" && "[&_tr]:bg-muted/40",
        className,
      )}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t border-border/70 bg-muted/40 font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-border/60 transition-colors hover:bg-muted/25 data-[state=selected]:bg-muted",
        className,
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  const { variant, stickyHeader } = useTableContext()

  const padding =
    variant === "comfortable"
      ? "px-5 py-3"
      : variant === "report"
        ? "px-3 py-2"
        : "px-4 py-2.5"

  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground text-left align-middle font-semibold whitespace-nowrap",
        padding,
        variant === "report" ? "text-[12px]" : "text-[13px]",
        stickyHeader
          ? "sticky top-0 z-20 bg-muted/80 backdrop-blur supports-[backdrop-filter]:bg-muted/60"
          : "bg-muted/50",
        "[&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  const { variant, wrap } = useTableContext()

  const padding =
    variant === "comfortable"
      ? "px-5 py-3"
      : variant === "report"
        ? "px-3 py-2"
        : "px-4 py-3"

  return (
    <td
      data-slot="table-cell"
      className={cn(
        "align-middle",
        padding,
        variant === "comfortable" ? "leading-6" : "leading-5",
        wrap === "wrap" ? "whitespace-normal break-words" : "whitespace-nowrap",
        "[&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
