import { IPagingInfo } from '@/types/pagination'
import { PaginationComponent, PaginationContent, PaginationItem } from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'
import { useScopedParams } from '@/utils/scoped_params'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export const Pagination = ({ meta }: { meta: IPagingInfo }) => {
  const { getScopedSearch } = useScopedParams()
  const navigate = useNavigate()
  const { page, pages, size } = meta
  const pageList = Array.from({ length: pages }, (_, i) => i + 1)

  const [row, setRow] = useState<string>(size.toString())

  const onChange = (value: string) => {
    navigate(getScopedSearch({ size: value, page: 1 }))
    setRow(value)
  }

  const onNavigate = (value: number) => {
    navigate(getScopedSearch({ page: value }))
  }

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-2">
        <p className="w-28 text-navy-800 dark:text-navy-200">Row per page </p>
        <div className="w-20">
          <Select value={row} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="150">150</SelectItem>
              <SelectItem value="200">200</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <PaginationComponent>
        <PaginationContent>
          {page > 1 && (
            <PaginationItem>
              <Button variant="outline" size="icon" onClick={() => onNavigate(page - 1)}>
                <ChevronLeft />
              </Button>
            </PaginationItem>
          )}
          {pageList.map((p) => (
            <PaginationItem key={p}>
              <Button
                variant={p === page ? 'default' : 'outline'}
                onClick={() => {
                  if (p !== page) {
                    onNavigate(p)
                  }
                }}>
                {p}
              </Button>
            </PaginationItem>
          ))}
          {page !== pages && (
            <PaginationItem>
              <Button size="icon" variant="outline" onClick={() => onNavigate(page + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </PaginationItem>
          )}
        </PaginationContent>
      </PaginationComponent>
    </div>
  )
}
