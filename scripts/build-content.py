# Compatibility entry point for the complete professional bank.
import runpy
from pathlib import Path
runpy.run_path(str(Path(__file__).with_name('build-expanded.py')),run_name='__main__')
