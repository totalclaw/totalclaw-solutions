"""背调红旗打分入口：python3 scripts/osint_check.py <邮箱|域名|网址|公司名> [--json] [--no-sanctions] [--no-tech-stack] [--no-linkedin]"""

import os
import sys

# 让同目录下的 trade/ 包可导入（隔离模式下脚本目录不会自动进 sys.path）
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from trade.osint.cli import main  # noqa: E402

if __name__ == "__main__":
    sys.exit(main())
