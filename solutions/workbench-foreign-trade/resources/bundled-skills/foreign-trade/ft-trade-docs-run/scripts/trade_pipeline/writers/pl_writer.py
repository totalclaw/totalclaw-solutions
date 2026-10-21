"""
writers/pl_writer.py — Unified PL Writer interface

本副本只保留内置 lite 模式（PLWriterLite）。上游的 full 模式通过
legacy/pl_gen_bridge.py 以子进程调用仓库外的 pl-gen 包（公开仓库不含该包，
目录不存在时本来就走 lite），已随 legacy/ 一起移除。
"""
from trade_pipeline.writers.base_writer import BaseWriter


class PLWriter(BaseWriter):
    """Unified PL Writer interface — always delegates to PLWriterLite."""

    def write(self, output_path: str, document_profile: str = "default", **kwargs) -> dict:
        from trade_pipeline.writers.pl_writer_lite import PLWriterLite
        lite = PLWriterLite(self.model, self.config)
        # Forward Gateway-related kwargs (packing_review, allow_missing_weight)
        result = lite.write(output_path, **kwargs)
        result["mode"] = "lite"
        return result
