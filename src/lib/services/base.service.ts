import api from "@/lib/axios";
import { AxiosRequestConfig } from "axios";

export class BaseService<
  TEntity,
  TCreate = Partial<TEntity>,
  TUpdate = Partial<TEntity>,
> {
  constructor(protected readonly endpoint: string) {}

  async getAll(config?: AxiosRequestConfig): Promise<TEntity[]> {
    const { data } = await api.get<TEntity[]>(this.endpoint, config);
    return data;
  }

  async getById(id: string, config?: AxiosRequestConfig): Promise<TEntity> {
    const { data } = await api.get<TEntity>(`${this.endpoint}/${id}`, config);
    return data;
  }

  async create(
    payload: TCreate,
    config?: AxiosRequestConfig
  ): Promise<TEntity> {
    const { data } = await api.post<TEntity>(this.endpoint, payload, config);
    return data;
  }

  async update(
    id: string,
    payload: TUpdate,
    config?: AxiosRequestConfig
  ): Promise<TEntity> {
    const { data } = await api.patch<TEntity>(
      `${this.endpoint}/${id}`,
      payload,
      config
    );
    return data;
  }

  async delete(id: string, config?: AxiosRequestConfig): Promise<void> {
    await api.delete(`${this.endpoint}/${id}`, config);
  }
}
